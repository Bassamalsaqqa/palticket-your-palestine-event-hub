import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportsService {
  constructor(private prisma: PrismaService) {}

  private toCsv(data: Record<string, unknown>[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((obj) =>
      headers
        .map((header) => {
          const val = obj[header];
          let strVal = '';
          if (val === null || val === undefined) {
            strVal = '';
          } else if (typeof val === 'string') {
            strVal = val;
          } else if (typeof val === 'number' || typeof val === 'boolean') {
            strVal = String(val);
          } else if (val instanceof Date) {
            strVal = val.toISOString();
          } else {
            strVal = JSON.stringify(val);
          }
          let escaped = strVal.replace(/"/g, '""');

          // CSV Injection protection: Prepend ' if it starts with =, +, -, @
          const sensitiveChars = ['=', '+', '-', '@'];
          if (sensitiveChars.some((char) => strVal.startsWith(char))) {
            strVal = `'${strVal}`;
            escaped = strVal.replace(/"/g, '""');
          }

          if (
            escaped.includes(',') ||
            escaped.includes('\n') ||
            escaped.includes('"')
          ) {
            escaped = `"${escaped}"`;
          }
          return escaped;
        })
        .join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }

  async exportOrders(
    organizationId: string,
    actorMemberId: string,
    eventId?: string,
  ): Promise<string> {
    const orders = await this.prisma.order.findMany({
      where: { organizationId, ...(eventId ? { eventId } : {}) },
      include: {
        user: { select: { email: true, name: true } },
        event: {
          select: {
            translations: { where: { locale: 'en' }, select: { name: true } },
          },
        },
        items: {
          include: {
            ticketType: { select: { name: true } },
          },
        },
        payments: {
          include: {
            createdBy: {
              include: {
                user: { select: { email: true, name: true } },
              },
            },
          },
        },
      },
    });

    const flatItems = orders.flatMap((o) => {
      const payment = o.payments[0]; // Assuming primary payment for now
      return o.items.map((item) => ({
        orderId: o.id,
        customerName: o.attendeeName || o.user.name || '',
        customerEmail: o.attendeeEmail || o.user.email || '',
        eventName: o.event.translations[0]?.name || '',
        ticketType: item.ticketType.name,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        currency: item.currency,
        priceVersionId: item.priceVersionId || '',
        orderStatus: o.status,
        paymentStatus: payment?.status || '',
        paymentMethod: payment?.method || '',
        providerReference: payment?.providerReference || '',
        capturedAt: payment?.capturedAt?.toISOString() || '',
        sellerMemberId: payment?.createdBy?.id || '',
        sellerName: payment?.createdBy?.user.name || '',
        sellerEmail: payment?.createdBy?.user.email || '',
        createdAt: o.createdAt.toISOString(),
      }));
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorMemberId,
        action: 'EXPORT_ORDERS',
        entityType: 'Order',
        metadata: { eventId, count: orders.length },
      },
    });

    return this.toCsv(flatItems);
  }

  async exportTickets(
    organizationId: string,
    actorMemberId: string,
    eventId?: string,
  ): Promise<string> {
    const tickets = await this.prisma.ticket.findMany({
      where: { organizationId, ...(eventId ? { eventId } : {}) },
      include: {
        ticketType: { select: { name: true } },
        event: {
          select: {
            translations: { where: { locale: 'en' }, select: { name: true } },
          },
        },
      },
    });

    const flatTickets = tickets.map((t) => ({
      id: t.id,
      code: t.code,
      attendeeName: t.attendeeName || '',
      attendeeEmail: t.attendeeEmail || '',
      eventName: t.event.translations[0]?.name || '',
      tierName: t.ticketType.name,
      status: t.status,
      scannedAt: t.scannedAt?.toISOString() || '',
      createdAt: t.createdAt.toISOString(),
    }));

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorMemberId,
        action: 'EXPORT_TICKETS',
        entityType: 'Ticket',
        metadata: { eventId, count: tickets.length },
      },
    });

    return this.toCsv(flatTickets);
  }
}
