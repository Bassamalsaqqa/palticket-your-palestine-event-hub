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

    return this.prisma.$transaction(async (tx) => {
      // 1. Validate Event
      const event = await tx.event.findFirst({
        where: { id: eventId, organizationId },
        select: { id: true },
      });

      if (!event) {
        throw new NotFoundException('Event not found or access denied');
      }

      // 2. Lock Inventory Rows
      // We sort IDs to prevent deadlocks if multiple orders hit same types in different order
      const ticketTypeIds = [
        ...new Set(items.map((i) => i.ticketTypeId)),
      ].sort();

      // Raw query to lock rows.
      // Note: Prisma raw query returns plain objects, need to map carefully.
      // We assume TicketTypeInventory exists.
      // Postgres: SELECT * FROM "TicketTypeInventory" WHERE "ticketTypeId" IN (...) FOR UPDATE

      const placeholders = ticketTypeIds.map((_, i) => `$${i + 1}`).join(',');
      const query = `
        SELECT * FROM "TicketTypeInventory"
        WHERE "ticketTypeId" IN (${placeholders})
        FOR UPDATE
      `;

      const inventoriesRaw = await tx.$queryRawUnsafe<any[]>(
        query,
        ...ticketTypeIds,
      );

      // Map to a more usable structure
      const inventories: Inventory[] = inventoriesRaw.map((inv) => ({
        id: inv.id as string,
        ticketTypeId: inv.ticketTypeId as string,
        capacity: inv.capacity as number,
        sold: inv.sold as number,
        reserved: inv.reserved as number,
      }));

      if (inventories.length !== ticketTypeIds.length) {
        throw new BadRequestException(
          'Inventory record missing for one or more ticket types',
        );
      }

      // 3. Check Capacity & 4. Increment Sold
      let totalCents = 0;
      const orderItemsData: {
        ticketTypeId: string;
        quantity: number;
        priceCents: number;
      }[] = [];

      // Fetch TicketTypes for pricing (no lock needed, assumed mostly static or versioned later)
      const ticketTypes = await tx.ticketType.findMany({
        where: { id: { in: ticketTypeIds } },
        select: { id: true, sellPriceCents: true, currency: true },
      });

      for (const item of items) {
        const inventory = inventories.find(
          (inv) => inv.ticketTypeId === item.ticketTypeId,
        );
        const typeInfo = ticketTypes.find((t) => t.id === item.ticketTypeId);

        if (!inventory || !typeInfo) {
          throw new BadRequestException(
            `Invalid ticket type: ${item.ticketTypeId}`,
          );
        }

        if (typeInfo.currency !== currency) {
          throw new BadRequestException(
            `Currency mismatch for ticket type ${item.ticketTypeId}`,
          );
        }

        if (
          inventory.sold + inventory.reserved + item.quantity >
          inventory.capacity
        ) {
          throw new BadRequestException(
            `Insufficient capacity for ticket type ${item.ticketTypeId}`,
          );
        }

        // Increment sold in memory for later DB update
        // We do single updates per row to be safe with the lock we hold
        await tx.ticketTypeInventory.update({
          where: { id: inventory.id },
          data: { sold: { increment: item.quantity } },
        });

        totalCents += typeInfo.sellPriceCents * item.quantity;
        orderItemsData.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          priceCents: typeInfo.sellPriceCents,
        });
      }

      // 5. Create Order
      // Payment Rules
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
          userId, // Seller is the user creating it in POS context? Or is there a "customer"?
          // Requirement says "Scope by organization/user", implying the user IS the caller (seller).
          // POS orders usually have an anonymous or ad-hoc customer.
          // For now, we link to the Seller User ID as the "owner" of the record context,
          // or we might need a separate customer field later.
          // Schema has `userId` on Order. We'll use the authenticated user (Seller).
          totalCents,
          currency,
          status: orderStatus,
          paymentStatus, // Legacy field, keeping in sync
          paymentProvider:
            paymentMethod === PaymentMethod.CARD ? 'manual' : null,
          paymentReference: providerReference,
          attendeeName: 'POS Walk-in', // Default for now
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
          createdByMemberId: undefined, // We need to resolve Member ID from User ID to populate this?
          // The requirement doesn't strictly demand looking up the member ID here,
          // but it's good practice. I'll skip for speed unless I can get it easily.
          // `userId` is available.
        },
      });

      // Generate Tickets
      const ticketsToCreate: Prisma.TicketCreateManyInput[] = [];
      for (const item of items) {
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
