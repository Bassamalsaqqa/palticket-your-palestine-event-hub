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
      },
    });

    const flatOrders = orders.map((o) => ({
      id: o.id,
      customerName: o.attendeeName || o.user.name || '',
      customerEmail: o.attendeeEmail || o.user.email || '',
      eventName: o.event.translations[0]?.name || '',
      total: o.totalCents / 100,
      currency: o.currency,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
    }));

    return this.toCsv(flatOrders);
  }

  async exportTickets(
    organizationId: string,
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

    return this.toCsv(flatTickets);
  }
}
