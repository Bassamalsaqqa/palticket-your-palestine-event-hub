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
    const { ticketCode, gateId } = data;

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
        // If ticket not found for this org, we treat it as invalid/not found.
        // We cannot log it because ScanLog requires a valid ticketId foreign key.
        return {
          status: 'invalid',
          message: 'Ticket not found',
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

      // 2. Check Ticket Status (Void)
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
          status: 'invalid',
          message: 'Ticket is void',
          timestamp: new Date(),
          ticket: {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            ticketType: ticket.ticketType.name,
          },
        };
      }

      // 3. Try Atomic Update (handles ISSUED -> SCANNED)
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
        // Already scanned (since we checked VOID above)
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
          status: 'duplicate',
          message: 'Ticket already scanned',
          timestamp: new Date(),
          ticket: {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            ticketType: ticket.ticketType.name,
          },
        };
      }

      // Success
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
        status: 'success',
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
}
