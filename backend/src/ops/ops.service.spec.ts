import { Test, TestingModule } from '@nestjs/testing';
import { OpsService } from './ops.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
  TicketStatus,
} from '@prisma/client';

describe('OpsService', () => {
  let service: OpsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<OpsService>(OpsService);
    prisma = module.get(PrismaService);

    // Mock interactive transaction
    prisma.$transaction.mockImplementation((cb: any) => cb(prisma));
  });

  const orgId = 'org-1';
  const userId = 'user-1';
  const eventId = 'event-1';
  const ticketTypeId = 'type-1';

  const mockDto = {
    eventId,
    currency: 'ILS',
    paymentMethod: PaymentMethod.CASH,
    items: [{ ticketTypeId, quantity: 2 }],
  };

  describe('createPosOrder', () => {
    it('should create CASH order successfully with row locks', async () => {
      // Mock Member check
      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'mem-1',
      } as any);

      // Mock Event check
      prisma.event.findFirst.mockResolvedValue({ id: eventId } as any);

      // Mock row lock result
      prisma.$queryRaw.mockResolvedValue([
        {
          id: 'inv-1',
          ticketTypeId,
          capacity: 10,
          sold: 0,
          reserved: 0,
        },
      ]);

      // Mock TicketType fetch
      prisma.ticketType.findMany.mockResolvedValue([
        {
          id: ticketTypeId,
          sellPriceCents: 1000,
          currency: 'ILS',
          eventId,
        },
      ] as any);

      // Mock creations
      prisma.order.create.mockResolvedValue({
        id: 'order-1',
        totalCents: 2000,
        currency: 'ILS',
        status: OrderStatus.PAID,
      } as any);
      prisma.ticket.findMany.mockResolvedValue([
        { id: 't-1', status: TicketStatus.ISSUED },
      ] as any);

      const result = await service.createPosOrder(orgId, userId, mockDto);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(prisma.ticketTypeInventory.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data: { sold: { increment: 2 } },
      });
      expect(result.order.status).toBe(OrderStatus.PAID);
      expect(result.payment.status).toBe(PaymentStatus.SUCCEEDED);
    });

    it('should aggregate duplicate items and prevent oversell', async () => {
      const dupDto = {
        ...mockDto,
        items: [
          { ticketTypeId, quantity: 6 },
          { ticketTypeId, quantity: 5 }, // Total 11
        ],
      };

      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'mem-1',
      } as any);
      prisma.event.findFirst.mockResolvedValue({ id: eventId } as any);

      // Capacity 10
      prisma.$queryRaw.mockResolvedValue([
        {
          id: 'inv-1',
          ticketTypeId,
          capacity: 10,
          sold: 0,
          reserved: 0,
        },
      ]);

      prisma.ticketType.findMany.mockResolvedValue([
        {
          id: ticketTypeId,
          sellPriceCents: 1000,
          currency: 'ILS',
          eventId,
        },
      ] as any);

      await expect(
        service.createPosOrder(orgId, userId, dupDto),
      ).rejects.toThrow(
        BadRequestException, // Insufficient capacity
      );
    });

    it('should throw BadRequestException if ticket type does not belong to event', async () => {
      prisma.organizationMember.findUnique.mockResolvedValue({ id: 'mem-1' } as any);
      prisma.event.findFirst.mockResolvedValue({ id: eventId } as any);
      
      // Capacity check not reached if validation fails
      prisma.$queryRaw.mockResolvedValue([]);

      // Simulate no ticket types found for this event
      prisma.ticketType.findMany.mockResolvedValue([]);

      await expect(service.createPosOrder(orgId, userId, mockDto)).rejects.toThrow(
        'One or more ticket types are invalid or do not belong to this event'
      );
    });

    it('should throw BadRequestException if capacity is exceeded', async () => {
      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'mem-1',
      } as any);
      prisma.event.findFirst.mockResolvedValue({ id: eventId } as any);

      // Capacity 10, Sold 9, Requesting 2 -> Fail
      prisma.$queryRaw.mockResolvedValue([
        {
          id: 'inv-1',
          ticketTypeId,
          capacity: 10,
          sold: 9,
          reserved: 0,
        },
      ]);

      prisma.ticketType.findMany.mockResolvedValue([
        {
          id: ticketTypeId,
          sellPriceCents: 1000,
          currency: 'ILS',
          eventId,
        },
      ] as any);

      await expect(
        service.createPosOrder(orgId, userId, mockDto),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it('should create PENDING order for CARD payment', async () => {
      const cardDto = {
        ...mockDto,
        paymentMethod: PaymentMethod.CARD,
        providerReference: 'REF-123',
      };

      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'mem-1',
      } as any);
      prisma.event.findFirst.mockResolvedValue({ id: eventId } as any);
      prisma.$queryRaw.mockResolvedValue([
        {
          id: 'inv-1',
          ticketTypeId,
          capacity: 10,
          sold: 0,
          reserved: 0,
        },
      ]);
      prisma.ticketType.findMany.mockResolvedValue([
        {
          id: ticketTypeId,
          sellPriceCents: 1000,
          currency: 'ILS',
          eventId,
        },
      ] as any);
      prisma.order.create.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING_PAYMENT,
      } as any);
      prisma.ticket.findMany.mockResolvedValue([
        { id: 't-1', status: TicketStatus.PENDING },
      ] as any);

      const result = await service.createPosOrder(orgId, userId, cardDto);

      expect(result.order.status).toBe(OrderStatus.PENDING_PAYMENT);
      expect(result.payment.status).toBe(PaymentStatus.PENDING);
      expect(result.tickets[0].status).toBe(TicketStatus.PENDING);
    });

    it('should throw BadRequestException if CARD payment missing reference', async () => {
      const invalidCardDto = {
        ...mockDto,
        paymentMethod: PaymentMethod.CARD,
      };

      await expect(
        service.createPosOrder(orgId, userId, invalidCardDto),
      ).rejects.toThrow('Provider reference required for CARD payments');
    });

    it('should throw BadRequestException if items array is empty', async () => {
      const emptyItemsDto = {
        ...mockDto,
        items: [],
      };

      await expect(
        service.createPosOrder(orgId, userId, emptyItemsDto),
      ).rejects.toThrow('Order must contain at least one item');
    });
  });

  describe('confirmPayment', () => {
    const orderId = 'order-1';

    it('should confirm payment and issue tickets successfully', async () => {
      // Mock Order fetch with pending payment
      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        organizationId: orgId,
        status: OrderStatus.PENDING_PAYMENT,
        payments: [{ id: 'pay-1', amountCents: 1000 }],
      } as any);

      // Mock Member lookup
      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'mem-1',
      } as any);

      // Mock Updates
      prisma.payment.update.mockResolvedValue({
        id: 'pay-1',
        status: PaymentStatus.SUCCEEDED,
      } as any);
      prisma.order.update.mockResolvedValue({
        id: orderId,
        status: OrderStatus.PAID,
      } as any);
      prisma.ticket.updateMany.mockResolvedValue({ count: 2 } as any);
      prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' } as any);

      const result = await service.confirmPayment(orgId, orderId, userId);

      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pay-1' },
          data: expect.objectContaining({ status: PaymentStatus.SUCCEEDED }),
        }),
      );
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: orderId },
          data: { status: OrderStatus.PAID },
        }),
      );
      expect(prisma.ticket.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId, status: TicketStatus.PENDING },
          data: { status: TicketStatus.ISSUED },
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'POS_CARD_CONFIRM',
            entityId: orderId,
          }),
        }),
      );
      expect(result.status).toBe(OrderStatus.PAID);
    });

    it('should throw NotFoundException if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(
        service.confirmPayment(orgId, orderId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if no pending CARD payment', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: orderId,
        organizationId: orgId,
        status: OrderStatus.PENDING_PAYMENT,
        payments: [], // Empty
      } as any);

      await expect(
        service.confirmPayment(orgId, orderId, userId),
      ).rejects.toThrow('No pending CARD payment found for this order');
    });
  });
});
