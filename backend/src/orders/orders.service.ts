import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
