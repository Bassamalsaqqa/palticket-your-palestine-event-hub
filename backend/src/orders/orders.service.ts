import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { TicketStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { getCurrencySymbol } from '../common/currency';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, userId: string, data: CreateOrderDto) {
    const { eventId, items, attendeeName, attendeeEmail, attendeePhone } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Validate Event exists and belongs to the Organization
      const event = await tx.event.findFirst({
        where: { id: eventId, organizationId },
        select: { id: true },
      });

      if (!event) {
        throw new BadRequestException('Event not found or access denied');
      }

      // 2. Validate all TicketTypes belong to this Event and get prices
      const ticketTypeIds = items.map((item) => item.ticketTypeId);
      const ticketTypes = await tx.ticketType.findMany({
        where: {
          id: { in: ticketTypeIds },
          eventId: event.id,
        },
        select: { id: true, sellPriceCents: true, name: true, currency: true },
      });

      if (ticketTypes.length !== Array.from(new Set(ticketTypeIds)).length) {
        throw new BadRequestException(
          'One or more ticket types are invalid for this event',
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

      // 3. Calculate Totals
      let totalCents = 0;
      const orderItemsData = items.map((item) => {
        const type = ticketTypes.find((t) => t.id === item.ticketTypeId)!;
        const lineTotal = type.sellPriceCents * item.quantity;
        totalCents += lineTotal;
        return {
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          priceCents: type.sellPriceCents,
        };
      });

      // 4. Create the Order
      const order = await tx.order.create({
        data: {
          organizationId,
          eventId,
          userId,
          totalCents,
          currency: orderCurrency,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
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
          createdAt: true,
        },
      });

      // 5. Generate Tickets
      const ticketsToCreate = [];
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          ticketsToCreate.push({
            organizationId,
            eventId,
            orderId: order.id,
            ticketTypeId: item.ticketTypeId,
            code: randomBytes(8).toString('hex').toUpperCase(), // 16 char unique code
            status: TicketStatus.ISSUED,
            attendeeName,
            attendeeEmail,
            attendeePhone,
          });
        }
      }

      await tx.ticket.createMany({
        data: ticketsToCreate,
      });

      // 6. Return explicit select
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

  async findAll(organizationId: string, eventId?: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.order.findMany({
      where: {
        organizationId,
        ...(eventId ? { eventId } : {}),
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
        createdAt: true,
        items: {
          select: {
            id: true,
            ticketTypeId: true,
            quantity: true,
            priceCents: true,
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
        createdAt: true,
        items: {
          select: {
            id: true,
            ticketTypeId: true,
            quantity: true,
            priceCents: true,
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
