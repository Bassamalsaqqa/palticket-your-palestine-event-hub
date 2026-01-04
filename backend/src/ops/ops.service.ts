import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePosOrderDto } from './dto/pos-order.dto';
import {
  OrderStatus,
  PaymentStatus,
  TicketStatus,
  Prisma,
  PaymentMethod,
} from '@prisma/client';
import { randomBytes } from 'crypto';

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
export class OpsService {
  constructor(private prisma: PrismaService) {}

  async createPosOrder(
    organizationId: string,
    userId: string, // The SELLER
    data: CreatePosOrderDto,
  ) {
    const { eventId, currency, paymentMethod, providerReference, items } = data;

    if (paymentMethod === PaymentMethod.CARD && !providerReference) {
      throw new BadRequestException(
        'Provider reference required for CARD payments',
      );
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      // 0. Resolve Seller Member ID
      const member = await tx.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId, userId } },
        select: { id: true },
      });

      // 1. Validate Event
      const event = await tx.event.findFirst({
        where: { id: eventId, organizationId },
        select: { id: true },
      });

      if (!event) {
        throw new NotFoundException('Event not found or access denied');
      }

      // Aggregate quantities to prevent duplicate ID bypass
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
          eventId: eventId, // Strict scoping
        },
        select: {
          id: true,
          sellPriceCents: true,
          currency: true,
          eventId: true,
        },
      });

      if (ticketTypes.length !== requestedTicketTypeIds.length) {
        throw new BadRequestException(
          'One or more ticket types are invalid or do not belong to this event',
        );
      }

      // 3. Lock Inventory Rows
      // Use validated IDs
      const query = Prisma.sql`
        SELECT * FROM "TicketTypeInventory"
        WHERE "ticketTypeId" IN (${Prisma.join(requestedTicketTypeIds)})
        FOR UPDATE
      `;

      const inventoriesRaw = await tx.$queryRaw<RawInventory[]>(query);

      // Map to a more usable structure
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

      // 3.5 Fetch active price versions
      const now = new Date();
      const priceVersions = await tx.ticketTypePriceVersion.findMany({
        where: {
          ticketTypeId: { in: requestedTicketTypeIds },
          currency: currency,
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

        // Validations already mostly done, just checking integrity
        if (!inventory || !typeInfo) {
          throw new BadRequestException(
            `Integrity error: Ticket type ${typeId} missing data`,
          );
        }

        if (typeInfo.currency !== currency) {
          throw new BadRequestException(
            `Currency mismatch for ticket type ${typeId}`,
          );
        }

        if (inventory.sold + inventory.reserved + qty > inventory.capacity) {
          throw new BadRequestException(
            `Insufficient capacity for ticket type ${typeId}`,
          );
        }

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
          currency: currency,
          priceVersionId: activeVersion?.id || null,
        });
      }

      // 5. Create Order
      const isPaid = paymentMethod === PaymentMethod.CASH;
      const orderStatus = isPaid
        ? OrderStatus.PAID
        : OrderStatus.PENDING_PAYMENT;
      const paymentStatus = isPaid
        ? PaymentStatus.SUCCEEDED
        : PaymentStatus.PENDING;
      const ticketStatus = isPaid ? TicketStatus.ISSUED : TicketStatus.PENDING;
      const capturedAt = isPaid ? new Date() : null;

      const order = await tx.order.create({
        data: {
          organizationId,
          eventId,
          userId,
          totalCents,
          currency,
          status: orderStatus,
          paymentStatus, // Legacy
          paymentProvider:
            paymentMethod === PaymentMethod.CARD ? 'manual' : null,
          paymentReference: providerReference,
          attendeeName: 'POS Walk-in',
          items: {
            create: orderItemsData,
          },
        },
      });

      // 6. Create Payment
      await tx.payment.create({
        data: {
          organizationId,
          orderId: order.id,
          method: paymentMethod,
          status: paymentStatus,
          amountCents: totalCents,
          currency,
          provider: paymentMethod === PaymentMethod.CARD ? 'manual' : null,
          providerReference,
          capturedAt,
          createdByMemberId: member?.id,
        },
      });

      // Generate Tickets
      const ticketsToCreate: Prisma.TicketCreateManyInput[] = [];
      for (const item of orderItemsData) {
        for (let i = 0; i < item.quantity; i++) {
          ticketsToCreate.push({
            organizationId,
            eventId,
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            code: randomBytes(8).toString('hex').toUpperCase(),
            status: ticketStatus,
          });
        }
      }

      await tx.ticket.createMany({ data: ticketsToCreate });

      // Return Summary
      const createdTickets = await tx.ticket.findMany({
        where: { orderId: order.id },
      });

      return {
        order,
        items: orderItemsData,
        tickets: createdTickets,
        payment: {
          method: paymentMethod,
          status: paymentStatus,
          amountCents: totalCents,
        },
      };
    });
  }

  async confirmPayment(
    organizationId: string,
    orderId: string,
    userId: string, // The actor (FINANCE/ADMIN)
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Order & Payment
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          payments: {
            where: {
              status: PaymentStatus.PENDING,
              method: PaymentMethod.CARD,
            },
          },
        },
      });

      if (!order || order.organizationId !== organizationId) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new BadRequestException(
          `Order is not pending payment (status: ${order.status})`,
        );
      }

      const payment = order.payments[0];
      if (!payment) {
        throw new BadRequestException(
          'No pending CARD payment found for this order',
        );
      }

      // 2. Resolve Actor Member ID for Audit
      const member = await tx.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId, userId } },
        select: { id: true },
      });

      // 3. Update Payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          capturedAt: new Date(),
        },
      });

      // 4. Update Order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
        },
      });

      // 5. Update Tickets
      await tx.ticket.updateMany({
        where: { orderId: orderId, status: TicketStatus.PENDING },
        data: { status: TicketStatus.ISSUED },
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          organizationId,
          actorMemberId: member?.id,
          action: 'POS_CARD_CONFIRM',
          entityType: 'Order',
          entityId: orderId,
          metadata: {
            paymentId: payment.id,
            amountCents: payment.amountCents,
          },
        },
      });

      return updatedOrder;
    });
  }
}
