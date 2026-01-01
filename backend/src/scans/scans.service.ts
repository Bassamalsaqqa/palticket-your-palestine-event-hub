import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScanRequestDto, ScanResponseDto } from './dto/scan.dto';
import { TicketStatus, ScanResult } from '@prisma/client';

@Injectable()
export class ScansService {
  constructor(private prisma: PrismaService) {}

  async scan(
    organizationId: string,
    userId: string,
    data: ScanRequestDto,
  ): Promise<ScanResponseDto> {
    const { ticketCode, gateId, eventId } = data;

    return this.prisma.$transaction(async (tx) => {
      // 1. Find ticket scoped to organization
      const ticket = await tx.ticket.findFirst({
        where: {
          code: ticketCode,
          organizationId,
        },
        include: { ticketType: true },
      });

      if (!ticket) {
        return {
          result: ScanResult.DENIED_INVALID_TICKET,
          message: 'Ticket not found or access denied',
          timestamp: new Date(),
        };
      }

      // Resolve scanner member ID
      const scannerMember = await tx.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId,
          },
        },
      });
      const scannedByMemberId = scannerMember?.id;

      // 2. Validate Event if provided
      if (eventId && ticket.eventId !== eventId) {
        await tx.scanLog.create({
          data: {
            organizationId,
            ticketId: ticket.id,
            gateId,
            scannedByUserId: userId,
            scannedByMemberId,
            result: ScanResult.DENIED_INVALID_EVENT,
          },
        });
        return {
          result: ScanResult.DENIED_INVALID_EVENT,
          message: 'Ticket belongs to another event',
          timestamp: new Date(),
          ticket: {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            ticketType: ticket.ticketType.name,
          },
        };
      }

      // 3. Validate Gate if provided (belongs to org)
      if (gateId) {
        const gate = await tx.gate.findFirst({
          where: { id: gateId, organizationId },
        });
        if (!gate) {
          return {
            result: ScanResult.DENIED_INVALID_TICKET,
            message: 'Invalid gate',
            timestamp: new Date(),
          };
        }
      }

      // 4. Check Ticket Status (Void)
      if (ticket.status === TicketStatus.VOID) {
        await tx.scanLog.create({
          data: {
            organizationId,
            ticketId: ticket.id,
            gateId,
            scannedByUserId: userId,
            scannedByMemberId,
            result: ScanResult.DENIED_INVALID_TICKET,
          },
        });
        return {
          result: ScanResult.DENIED_INVALID_TICKET,
          message: 'Ticket is void',
          timestamp: new Date(),
          ticket: {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            ticketType: ticket.ticketType.name,
          },
        };
      }

      // 5. Try Atomic Update (handles ISSUED -> SCANNED)
      const updateResult = await tx.ticket.updateMany({
        where: {
          id: ticket.id,
          status: TicketStatus.ISSUED,
        },
        data: {
          status: TicketStatus.SCANNED,
          scannedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        // Already scanned
        await tx.scanLog.create({
          data: {
            organizationId,
            ticketId: ticket.id,
            gateId,
            scannedByUserId: userId,
            scannedByMemberId,
            result: ScanResult.DENIED_ALREADY_USED,
          },
        });
        return {
          result: ScanResult.DENIED_ALREADY_USED,
          message: 'Ticket already scanned',
          timestamp: new Date(),
          ticket: {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            ticketType: ticket.ticketType.name,
          },
        };
      }

      // 6. Success
      await tx.scanLog.create({
        data: {
          organizationId,
          ticketId: ticket.id,
          gateId,
          scannedByUserId: userId,
          scannedByMemberId,
          result: ScanResult.GRANTED,
        },
      });

      return {
        result: ScanResult.GRANTED,
        message: 'Access Granted',
        timestamp: new Date(),
        ticket: {
          id: ticket.id,
          attendeeName: ticket.attendeeName,
          ticketType: ticket.ticketType.name,
        },
      };
    });
  }

  async findScanLogs(
    organizationId: string,
    query: {
      eventId?: string;
      gateId?: string;
      skip?: number;
      take?: number;
    },
  ) {
    const { eventId, gateId, skip = 0, take = 20 } = query;
    const limit = Math.min(take, 100);

    return this.prisma.scanLog.findMany({
      where: {
        organizationId,
        ...(gateId ? { gateId } : {}),
        ...(eventId ? { ticket: { eventId } } : {}),
      },
      include: {
        ticket: {
          select: {
            code: true,
            attendeeName: true,
            event: {
              select: {
                translations: {
                  where: { locale: 'en' },
                  select: { name: true },
                },
              },
            },
          },
        },
        scannedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        gate: {
          select: {
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { scannedAt: 'desc' },
    });
  }
}
