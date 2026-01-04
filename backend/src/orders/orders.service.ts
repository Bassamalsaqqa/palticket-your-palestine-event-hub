import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  TicketStatus,
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { getCurrencySymbol } from '../common/currency';
import { EventPolicyService } from '../events/event-policy.service';

interface Inventory {
  id: string;
  ticketTypeId: string;
  capacity: number;
  sold: number;
  reserved: number;
}

interface RawInventory {
  id: string;
  ticketTypeId: string;
  capacity: number;
  sold: number;
  reserved: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventPolicy: EventPolicyService,
  ) {}

  async create(organizationId: string, userId: string, data: CreateOrderDto) {
    const { eventId, items, attendeeName, attendeeEmail, attendeePhone } = data;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Validate Event exists and belongs to the Organization
      const event = await tx.event.findFirst({
        where: { id: eventId, organizationId },
        select: { id: true, status: true, startTime: true, endTime: true },
      });

      if (!event) {
        throw new BadRequestException('Event not found or access denied');
      }

      if (!this.eventPolicy.canSell(event)) {
        throw new BadRequestException(
          'Tickets for this event are not currently available for sale',
        );
      }

      // Aggregate quantities
      const quantities = items.reduce(
        (acc, item) => {
          acc[item.ticketTypeId] =
            (acc[item.ticketTypeId] || 0) + item.quantity;
          return acc;
        },
        {} as Record<string, number>,
      );
      const requestedTicketTypeIds = Object.keys(quantities).sort();

      // 2. Validate Ticket Types ownership (Pre-lock)
      const ticketTypes = await tx.ticketType.findMany({
        where: {
          id: { in: requestedTicketTypeIds },
          eventId: event.id,
        },
        select: { id: true, sellPriceCents: true, name: true, currency: true },
      });

      if (ticketTypes.length !== requestedTicketTypeIds.length) {
        throw new BadRequestException(
          'One or more ticket types are invalid for this event',
        );
      }

      // 3. Lock Inventory Rows
      const query = Prisma.sql`
        SELECT * FROM "TicketTypeInventory"
        WHERE "ticketTypeId" IN (${Prisma.join(requestedTicketTypeIds)})
        FOR UPDATE
      `;

      const inventoriesRaw = await tx.$queryRaw<RawInventory[]>(query); // Using any[] to avoid strict type issues locally, mapped below

      const inventories: Inventory[] = inventoriesRaw.map((inv) => ({
        id: inv.id,
        ticketTypeId: inv.ticketTypeId,
        capacity: inv.capacity,
        sold: inv.sold,
        reserved: inv.reserved,
      }));

      if (inventories.length !== requestedTicketTypeIds.length) {
        throw new BadRequestException(
          'Inventory record missing for one or more ticket types',
        );
      }

      // Validate currency consistency
      const orderCurrency = ticketTypes[0].currency;
      const allSameCurrency = ticketTypes.every(
        (t) => t.currency === orderCurrency,
      );
      if (!allSameCurrency) {
        throw new BadRequestException(
          'All ticket types must use the same currency',
        );
      }

      // 3.5 Fetch active price versions
      const now = new Date();
      const priceVersions = await tx.ticketTypePriceVersion.findMany({
        where: {
          ticketTypeId: { in: requestedTicketTypeIds },
          currency: orderCurrency,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
      });

      // 4. Check Capacity & Increment Sold
      let totalCents = 0;
      const orderItemsData: {
        ticketTypeId: string;
        quantity: number;
        priceCents: number;
        unitPriceCents: number;
        currency: string;
        priceVersionId: string | null;
      }[] = [];

      for (const typeId of requestedTicketTypeIds) {
        const inventory = inventories.find(
          (inv) => inv.ticketTypeId === typeId,
        );
        const typeInfo = ticketTypes.find((t) => t.id === typeId);
        const qty = quantities[typeId];

        if (!inventory || !typeInfo) {
          throw new BadRequestException(`Invalid ticket type: ${typeId}`);
        }

        if (inventory.sold + inventory.reserved + qty > inventory.capacity) {
          throw new BadRequestException(
            `Insufficient capacity for ticket type: ${typeInfo.name}`,
          );
        }

        // Increment sold
        await tx.ticketTypeInventory.update({
          where: { id: inventory.id },
          data: { sold: { increment: qty } },
        });

        // Determine active price version
        const activeVersion = priceVersions.find(
          (v) => v.ticketTypeId === typeId,
        );
        const unitPrice = activeVersion
          ? activeVersion.priceCents
          : typeInfo.sellPriceCents;

        totalCents += unitPrice * qty;
        orderItemsData.push({
          ticketTypeId: typeId,
          quantity: qty,
          priceCents: unitPrice,
          unitPriceCents: unitPrice,
          currency: orderCurrency,
          priceVersionId: activeVersion?.id || null,
        });
      }

      // 5. Create the Order
      const order = await tx.order.create({
        data: {
          organizationId,
          eventId,
          userId,
          totalCents,
          currency: orderCurrency,
          status: OrderStatus.PENDING_PAYMENT,
          paymentStatus: PaymentStatus.PENDING,
          attendeeName,
          attendeeEmail,
          attendeePhone,
          items: {
            create: orderItemsData,
          },
        },
        select: {
          id: true,
          totalCents: true,
          currency: true,
          status: true,
          paymentStatus: true,
          paymentProvider: true,
          paymentReference: true,
          attendeeName: true,
          createdAt: true,
        },
      });

      // 6. Generate Tickets (PENDING)
      const ticketsToCreate: Prisma.TicketCreateManyInput[] = [];
      for (const item of orderItemsData) {
        for (let i = 0; i < item.quantity; i++) {
          ticketsToCreate.push({
            organizationId,
            eventId,
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            code: randomBytes(8).toString('hex').toUpperCase(),
            status: TicketStatus.PENDING, // Tickets are PENDING until paid
            attendeeName,
            attendeeEmail,
            attendeePhone,
          });
        }
      }

      await tx.ticket.createMany({
        data: ticketsToCreate,
      });

      // 6.5 Audit Log
      await tx.auditLog.create({
        data: {
          organizationId,
          action: 'ORDER_CREATE',
          entityType: 'Order',
          entityId: order.id,
          metadata: {
            eventId,
            userId,
            totalCents: order.totalCents,
            ticketCount: ticketsToCreate.length,
          },
        },
      });

      // 7. Return explicit select
      const createdTickets = await tx.ticket.findMany({
        where: { orderId: order.id },
        select: {
          id: true,
          code: true,
          status: true,
          ticketType: { select: { name: true } },
        },
      });

      return {
        ...order,
        currencySymbol: getCurrencySymbol(order.currency),
        items: orderItemsData,
        tickets: createdTickets,
      };
    });
  }

  async findAll(
    organizationId: string,
    eventId?: string,
    userId?: string,
    skip = 0,
    take = 20,
  ) {
    const limit = Math.min(take, 100);
    return this.prisma.order.findMany({
      where: {
        organizationId,
        ...(eventId ? { eventId } : {}),
        ...(userId ? { userId } : {}),
      },
      select: {
        id: true,
        userId: true,
        totalCents: true,
        currency: true,
        status: true,
        paymentStatus: true,
        paymentProvider: true,
        paymentReference: true,
        attendeeName: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            ticketTypeId: true,
            quantity: true,
            priceCents: true,
            unitPriceCents: true,
            currency: true,
            priceVersionId: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.order.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        userId: true,
        totalCents: true,
        currency: true,
        status: true,
        paymentStatus: true,
        paymentProvider: true,
        paymentReference: true,
        attendeeName: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            ticketTypeId: true,
            quantity: true,
            priceCents: true,
            unitPriceCents: true,
            currency: true,
            priceVersionId: true,
          },
        },
        tickets: {
          select: {
            id: true,
            code: true,
            status: true,
          },
        },
      },
    });
  }
}
