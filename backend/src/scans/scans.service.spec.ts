import { Test, TestingModule } from '@nestjs/testing';
import { ScansService } from './scans.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { TicketStatus, ScanResult } from '@prisma/client';

describe('ScansService', () => {
  let service: ScansService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScansService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<ScansService>(ScansService);
    prisma = module.get(PrismaService);

    // Mock transaction to just execute the callback
    prisma.$transaction.mockImplementation((callback) => callback(prisma));
  });

  const orgId = 'org-1';
  const userId = 'user-1';
  const ticketCode = 'TICKET-123';
  const ticketId = 'ticket-id-1';

  const mockTicket: any = {
    id: ticketId,
    code: ticketCode,
    organizationId: orgId,
    status: TicketStatus.ISSUED,
    ticketType: { name: 'General' },
  };

  const mockMember: any = {
    id: 'member-1',
    role: 'STAFF',
  };

  it('should return invalid if ticket not found', async () => {
    prisma.ticket.findFirst.mockResolvedValue(null);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.status).toBe('invalid');
    expect(result.message).toBe('Ticket not found');
    expect(prisma.scanLog.create).not.toHaveBeenCalled();
  });

  it('should return invalid if ticket exists in different org (findFirst returns null)', async () => {
    // Service uses findFirst with organizationId filter.
    // If ticket exists in DB but wrong org, findFirst returns null.
    prisma.ticket.findFirst.mockResolvedValue(null);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.status).toBe('invalid');
    expect(result.message).toBe('Ticket not found');
    expect(prisma.scanLog.create).not.toHaveBeenCalled();
  });

  it('should return success and log GRANTED for valid ISSUED ticket', async () => {
    prisma.ticket.findFirst.mockResolvedValue(mockTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);
    prisma.ticket.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.status).toBe('success');
    expect(prisma.ticket.updateMany).toHaveBeenCalledWith({
      where: { id: ticketId, status: TicketStatus.ISSUED },
      data: expect.objectContaining({ status: TicketStatus.SCANNED }),
    });
    expect(prisma.scanLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ result: ScanResult.GRANTED }),
      }),
    );
  });

  it('should return duplicate if ticket already SCANNED (race condition check)', async () => {
    prisma.ticket.findFirst.mockResolvedValue(mockTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.status).toBe('duplicate');
    expect(prisma.scanLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: ScanResult.DENIED_ALREADY_USED,
        }),
      }),
    );
  });

  it('should return duplicate if ticket status is SCANNED initially', async () => {
    prisma.ticket.findFirst.mockResolvedValue({
      ...mockTicket,
      status: TicketStatus.SCANNED,
    });
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.status).toBe('duplicate');
    expect(prisma.scanLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: ScanResult.DENIED_ALREADY_USED,
        }),
      }),
    );
  });

  it('should return invalid if ticket is VOID', async () => {
    prisma.ticket.findFirst.mockResolvedValue({
      ...mockTicket,
      status: TicketStatus.VOID,
    });
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.status).toBe('invalid');
    expect(result.message).toBe('Ticket is void');
    expect(prisma.scanLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: ScanResult.DENIED_INVALID_TICKET,
        }),
      }),
    );
  });
});
