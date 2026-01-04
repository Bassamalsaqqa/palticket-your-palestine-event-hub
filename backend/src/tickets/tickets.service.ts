import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async voidTicket(organizationId: string, id: string, actorMemberId?: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, organizationId },
      select: { id: true, status: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== TicketStatus.ISSUED) {
      throw new BadRequestException(
        `Cannot void ticket in status ${ticket.status}`,
      );
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.VOID },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorMemberId,
        action: 'TICKET_VOID',
        entityType: 'Ticket',
        entityId: id,
        metadata: { oldStatus: ticket.status, newStatus: updated.status },
      },
    });

    return updated;
  }

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
