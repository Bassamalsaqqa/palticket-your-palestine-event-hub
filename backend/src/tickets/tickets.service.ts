import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    eventId?: string,
    orderId?: string,
    skip = 0,
    take = 20,
  ) {
    const limit = Math.min(take, 100);
    return this.prisma.ticket.findMany({
      where: {
        organizationId,
        ...(eventId ? { eventId } : {}),
        ...(orderId ? { orderId } : {}),
      },
      select: {
        id: true,
        code: true,
        status: true,
        ticketTypeId: true,
        orderId: true,
        ticketType: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.ticket.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        code: true,
        status: true,
        ticketTypeId: true,
        orderId: true,
        ticketType: {
          select: {
            name: true,
          },
        },
        scanLogs: {
          select: {
            scannedAt: true,
            result: true,
            gateId: true,
          },
        },
      },
    });
  }
}
