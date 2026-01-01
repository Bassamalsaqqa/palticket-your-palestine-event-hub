import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScanResult } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEvents, totalOrders, totalTickets, totalRevenue, scansToday] =
      await Promise.all([
        this.prisma.event.count({
          where: { organizationId },
        }),
        this.prisma.order.count({
          where: { organizationId },
        }),
        this.prisma.ticket.count({
          where: { organizationId },
        }),
        this.prisma.order.aggregate({
          where: { organizationId, status: 'PAID' },
          _sum: {
            totalCents: true,
          },
        }),
        this.prisma.scanLog.count({
          where: {
            organizationId,
            scannedAt: { gte: today },
            result: ScanResult.GRANTED,
          },
        }),
      ]);

    return {
      totalEvents,
      totalOrders,
      totalTickets,
      totalRevenueCents: totalRevenue._sum.totalCents || 0,
      scansToday,
    };
  }
}
