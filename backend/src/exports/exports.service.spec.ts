import { Test, TestingModule } from '@nestjs/testing';
import { ExportsService } from './exports.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('ExportsService', () => {
  let service: ExportsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<ExportsService>(ExportsService);
    prisma = module.get(PrismaService);
  });

  const orgId = 'org-1';
  const memberId = 'mem-1';

  describe('exportOrders', () => {
    it('should return CSV with payment details and log audit', async () => {
      const mockOrder = {
        id: 'ord-1',
        totalCents: 1000,
        currency: 'ILS',
        status: 'PAID',
        paymentStatus: 'SUCCEEDED',
        attendeeName: 'Test Attendee',
        attendeeEmail: 'test@example.com',
        createdAt: new Date('2026-01-01'),
        event: { translations: [{ name: 'Event 1' }] },
        user: { email: 'user@example.com', name: 'User' },
        payments: [
          {
            method: 'CARD',
            status: 'SUCCEEDED',
            providerReference: 'ref-123',
            capturedAt: new Date('2026-01-01'),
            createdBy: {
              user: { name: 'Seller', email: 'seller@example.com' },
            },
          },
        ],
      };

      prisma.order.findMany.mockResolvedValue([mockOrder] as any);
      prisma.auditLog.create.mockResolvedValue({ id: 'log-1' } as any);

      const csv = await service.exportOrders(orgId, memberId);

      expect(csv).toContain('paymentMethod');
      expect(csv).toContain('providerReference');
      expect(csv).toContain('capturedAt');
      expect(csv).toContain('sellerMemberId');
      expect(csv).toContain('sellerName');
      expect(csv).toContain('CARD');
      expect(csv).toContain('ref-123');
      expect(csv).toContain('Seller');

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: orgId,
            actorMemberId: memberId,
            action: 'EXPORT_ORDERS',
          }),
        }),
      );
    });
  });

  describe('exportTickets', () => {
    it('should return CSV tickets and log audit', async () => {
      const mockTicket = {
        id: 'tkt-1',
        code: 'CODE123',
        status: 'ISSUED',
        createdAt: new Date('2026-01-01'),
        scannedAt: null,
        ticketType: { name: 'VIP' },
        event: { translations: [{ name: 'Event 1' }] },
        attendeeName: 'Attendee',
        attendeeEmail: 'att@example.com',
      };

      prisma.ticket.findMany.mockResolvedValue([mockTicket] as any);
      prisma.auditLog.create.mockResolvedValue({ id: 'log-2' } as any);

      const csv = await service.exportTickets(orgId, memberId);

      expect(csv).toContain('code');
      expect(csv).toContain('attendeeName');
      expect(csv).toContain('eventName');
      expect(csv).toContain('tierName');
      expect(csv).toContain('CODE123');
      expect(csv).toContain('VIP');

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: orgId,
            actorMemberId: memberId,
            action: 'EXPORT_TICKETS',
          }),
        }),
      );
    });
  });
});
