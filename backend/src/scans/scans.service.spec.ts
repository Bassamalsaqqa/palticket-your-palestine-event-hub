import { Test, TestingModule } from '@nestjs/testing';
import { ScansService } from './scans.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  OrganizationMember,
  OrganizationRole,
  Prisma,
  ScanResult,
  TicketStatus,
} from '@prisma/client';

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
    prisma.$transaction.mockImplementation(
      <T>(callback: (tx: PrismaService) => Promise<T>) => callback(prisma),
    );
  });

  const orgId = 'org-1';
  const userId = 'user-1';
  const ticketCode = 'TICKET-123';
  const ticketId = 'ticket-id-1';

  const mockTicket = {
    id: ticketId,
    organizationId: orgId,
    eventId: 'event-1',
    orderId: 'order-1',
    ticketTypeId: 'type-1',
    code: ticketCode,
    status: TicketStatus.ISSUED,
    scannedAt: null,
    attendeeName: null,
    attendeeEmail: null,
    attendeePhone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ticketType: { name: 'General' },
  } satisfies Prisma.TicketGetPayload<{ include: { ticketType: true } }>;

  const mockMember: OrganizationMember = {
    id: 'member-1',
    organizationId: orgId,
    userId,
    role: OrganizationRole.SELLER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return invalid if ticket not found', async () => {
    prisma.ticket.findFirst.mockResolvedValue(null);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.DENIED_INVALID_TICKET);
    expect(result.message).toBe('Ticket not found or access denied');
    expect(prisma.scanLog.create.mock.calls.length).toBe(0);
  });

  it('should return invalid if ticket exists in different org (findFirst returns null)', async () => {
    // Service uses findFirst with organizationId filter.
    // If ticket exists in DB but wrong org, findFirst returns null.
    prisma.ticket.findFirst.mockResolvedValue(null);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.DENIED_INVALID_TICKET);
    expect(result.message).toBe('Ticket not found or access denied');
    expect(prisma.scanLog.create.mock.calls.length).toBe(0);
  });

  it('should return success and log GRANTED for valid ISSUED ticket', async () => {
    prisma.ticket.findFirst.mockResolvedValue(mockTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);
    prisma.ticket.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.GRANTED);
    expect(prisma.ticket.updateMany.mock.calls.length).toBe(1);
    const updateArgs = prisma.ticket.updateMany.mock.calls[0]?.[0];
    expect(updateArgs?.where).toMatchObject({
      id: ticketId,
      status: TicketStatus.ISSUED,
    });
    expect(updateArgs?.data).toMatchObject({
      status: TicketStatus.SCANNED,
    });
    expect(prisma.scanLog.create.mock.calls.length).toBe(1);
    const grantedLogArgs = prisma.scanLog.create.mock.calls[0]?.[0];
    expect(grantedLogArgs?.data?.result).toBe(ScanResult.GRANTED);
  });

  it('should return duplicate if ticket already SCANNED (race condition check)', async () => {
    prisma.ticket.findFirst.mockResolvedValue(mockTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.DENIED_ALREADY_USED);
    expect(prisma.scanLog.create.mock.calls.length).toBe(1);
    const duplicateLogArgs = prisma.scanLog.create.mock.calls[0]?.[0];
    expect(duplicateLogArgs?.data?.result).toBe(ScanResult.DENIED_ALREADY_USED);
  });

  it('should return duplicate if ticket status is SCANNED initially', async () => {
    const scannedTicket: typeof mockTicket = {
      ...mockTicket,
      status: TicketStatus.SCANNED,
    };
    prisma.ticket.findFirst.mockResolvedValue(scannedTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);
    prisma.ticket.updateMany.mockResolvedValue({ count: 0 });

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.DENIED_ALREADY_USED);
    expect(prisma.scanLog.create.mock.calls.length).toBe(1);
    const duplicateLogArgs = prisma.scanLog.create.mock.calls[0]?.[0];
    expect(duplicateLogArgs?.data?.result).toBe(ScanResult.DENIED_ALREADY_USED);
  });

  it('should return invalid if ticket is VOID', async () => {
    const voidTicket: typeof mockTicket = {
      ...mockTicket,
      status: TicketStatus.VOID,
    };
    prisma.ticket.findFirst.mockResolvedValue(voidTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.DENIED_INVALID_TICKET);
    expect(result.message).toBe('Ticket is void');
    expect(prisma.scanLog.create.mock.calls.length).toBe(1);
    const voidLogArgs = prisma.scanLog.create.mock.calls[0]?.[0];
    expect(voidLogArgs?.data?.result).toBe(ScanResult.DENIED_INVALID_TICKET);
  });

  it('should return payment not confirmed if ticket is PENDING', async () => {
    const pendingTicket: typeof mockTicket = {
      ...mockTicket,
      status: TicketStatus.PENDING,
    };
    prisma.ticket.findFirst.mockResolvedValue(pendingTicket);
    prisma.organizationMember.findUnique.mockResolvedValue(mockMember);

    const result = await service.scan(orgId, userId, { ticketCode });

    expect(result.result).toBe(ScanResult.DENIED_PAYMENT_NOT_CONFIRMED);
    expect(result.message).toBe('Payment not confirmed');
    expect(prisma.scanLog.create.mock.calls.length).toBe(1);
    const logArgs = prisma.scanLog.create.mock.calls[0]?.[0];
    expect(logArgs?.data?.result).toBe(ScanResult.DENIED_PAYMENT_NOT_CONFIRMED);
  });
});
