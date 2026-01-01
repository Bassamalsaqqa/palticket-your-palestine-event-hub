import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    eventId?: string,
    orderId?: string,
    userId?: string,
    skip = 0,
    take = 20,
  ) {
    const limit = Math.min(take, 100);
    return this.prisma.ticket.findMany({
      where: {
        organizationId,
        ...(eventId ? { eventId } : {}),
        ...(orderId ? { orderId } : {}),
        ...(userId ? { order: { userId } } : {}),
      },
      select: {
        id: true,
        code: true,
        status: true,
        ticketTypeId: true,
        eventId: true,
        orderId: true,
        ticketType: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            userId: true,
          },
        },
        scanLogs: {
          select: {
            scannedAt: true,
            result: true,
            gate: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            scannedAt: 'desc',
          },
          take: 10,
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
        eventId: true,
        orderId: true,
        ticketType: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            userId: true,
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
