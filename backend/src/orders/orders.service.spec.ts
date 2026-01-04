import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  TicketStatus,
} from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get(PrismaService);

    // Mock transaction to just execute the callback
    prisma.$transaction.mockImplementation(
      <T>(callback: (tx: PrismaService) => Promise<T>) => callback(prisma),
    );
  });

  const orgId = 'org-1';
  const userId = 'user-1';
  const eventId = 'event-1';
  const ticketTypeId = 'type-1';
  const now = new Date();

  type EventIdOnly = Prisma.EventGetPayload<{ select: { id: true } }>;
  type TicketTypePricing = Prisma.TicketTypeGetPayload<{
    select: { id: true; sellPriceCents: true; name: true; currency: true };
  }>;
  type OrderSummary = Prisma.OrderGetPayload<{
    select: {
      id: true;
      totalCents: true;
      currency: true;
      status: true;
      paymentStatus: true;
      paymentProvider: true;
      paymentReference: true;
      createdAt: true;
    };
  }>;
  type TicketWithTypeName = Prisma.TicketGetPayload<{
    select: {
      id: true;
      code: true;
      status: true;
      ticketType: { select: { name: true } };
    };
  }>;

  const mockEvent: EventIdOnly = {
    id: eventId,
  };

  const mockTicketType: TicketTypePricing = {
    id: ticketTypeId,
    sellPriceCents: 1000,
    currency: 'ILS',
    name: 'General',
  };

  const mockOrder: OrderSummary = {
    id: 'order-1',
    totalCents: 2000,
    currency: 'ILS',
    status: OrderStatus.PENDING_PAYMENT,
    paymentStatus: PaymentStatus.PENDING,
    paymentProvider: null,
    paymentReference: null,
    createdAt: now,
  };

  const mockTickets: TicketWithTypeName[] = [
    {
      id: 't-1',
      code: 'C1',
      status: TicketStatus.PENDING,
      ticketType: { name: 'General' },
    },
    {
      id: 't-2',
      code: 'C2',
      status: TicketStatus.PENDING,
      ticketType: { name: 'General' },
    },
  ];

  it('should create an order and tickets successfully', async () => {
    const createDto = {
      eventId,
      items: [{ ticketTypeId, quantity: 2 }],
      attendeeName: 'Ahmad',
    };

    prisma.event.findFirst.mockResolvedValue(mockEvent);
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 'inv-1',
        ticketTypeId,
        capacity: 10,
        sold: 0,
        reserved: 0,
      },
    ]);
    prisma.ticketType.findMany.mockResolvedValue([mockTicketType]);
    prisma.order.create.mockResolvedValue(mockOrder);
    prisma.ticket.findMany.mockResolvedValue(mockTickets);

    const result = await service.create(orgId, userId, createDto);

    expect(result.totalCents).toBe(2000);
    expect(result.currencySymbol).toBe('\u20AA');
    expect(result.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(result.tickets).toHaveLength(2);
    expect(prisma.$queryRaw).toHaveBeenCalled();
    expect(prisma.ticketTypeInventory.update).toHaveBeenCalledWith({
      where: { id: 'inv-1' },
      data: { sold: { increment: 2 } },
    });
    expect(prisma.order.create.mock.calls.length).toBe(1);
    expect(prisma.ticket.createMany.mock.calls.length).toBe(1);

    // Check ticket creation status
    const ticketCreateArgs = prisma.ticket.createMany.mock.calls[0][0];
    const ticketData = ticketCreateArgs?.data;
    const firstTicket = Array.isArray(ticketData) ? ticketData[0] : ticketData;
    expect(firstTicket?.status).toBe(TicketStatus.PENDING);
  });

  it('should throw BadRequestException if items array is empty', async () => {
    const createDto = {
      eventId,
      items: [],
    };

    await expect(service.create(orgId, userId, createDto)).rejects.toThrow(
      'Order must contain at least one item',
    );
  });

  it('should explicitly set OrderStatus to PENDING_PAYMENT', async () => {
    const createDto = {
      eventId,
      items: [{ ticketTypeId, quantity: 1 }],
    };

    prisma.event.findFirst.mockResolvedValue(mockEvent);
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 'inv-1',
        ticketTypeId,
        capacity: 10,
        sold: 0,
        reserved: 0,
      },
    ]);
    prisma.ticketType.findMany.mockResolvedValue([mockTicketType]);
    prisma.order.create.mockResolvedValue(mockOrder);
    prisma.ticket.findMany.mockResolvedValue(mockTickets);

    await service.create(orgId, userId, createDto);

    const createCallArgs = prisma.order.create.mock.calls[0]?.[0];
    expect(createCallArgs?.data.status).toBe(OrderStatus.PENDING_PAYMENT);
  });

  it('should throw BadRequestException if inventory is insufficient', async () => {
    prisma.event.findFirst.mockResolvedValue(mockEvent);
    prisma.$queryRaw.mockResolvedValue([
      {
        id: 'inv-1',
        ticketTypeId,
        capacity: 10,
        sold: 9,
        reserved: 0,
      },
    ]);
    prisma.ticketType.findMany.mockResolvedValue([mockTicketType]);

    const createDto = {
      eventId,
      items: [{ ticketTypeId, quantity: 2 }], // 9+2 > 10
    };

    await expect(service.create(orgId, userId, createDto)).rejects.toThrow(
      'Insufficient capacity for ticket type: General',
    );
    expect(prisma.order.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if event not found', async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    const createDto = {
      eventId,
      items: [{ ticketTypeId, quantity: 1 }],
    };

    await expect(service.create(orgId, userId, createDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if currencies mismatch', async () => {
    prisma.event.findFirst.mockResolvedValue(mockEvent);
    prisma.$queryRaw.mockResolvedValue([
      { id: 'inv-1', ticketTypeId: 't1', capacity: 10, sold: 0, reserved: 0 },
      { id: 'inv-2', ticketTypeId: 't2', capacity: 10, sold: 0, reserved: 0 },
    ]);
    prisma.ticketType.findMany.mockResolvedValue([
      { id: 't1', currency: 'USD', sellPriceCents: 100, name: 'USD Tier' },
      { id: 't2', currency: 'ILS', sellPriceCents: 100, name: 'ILS Tier' },
    ]);

    const createDto = {
      eventId,
      items: [
        { ticketTypeId: 't1', quantity: 1 },
        { ticketTypeId: 't2', quantity: 1 },
      ],
    };

    await expect(service.create(orgId, userId, createDto)).rejects.toThrow(
      'All ticket types must use the same currency',
    );
  });

  it('should throw BadRequestException if some ticket types are invalid', async () => {
    prisma.event.findFirst.mockResolvedValue(mockEvent);
    prisma.$queryRaw.mockResolvedValue([
      { id: 'inv-1', ticketTypeId: 't1', capacity: 10, sold: 0, reserved: 0 },
    ]);
    // Only returns one type even though two were requested
    prisma.ticketType.findMany.mockResolvedValue([
      { id: 't1', currency: 'USD', sellPriceCents: 100, name: 'USD Tier' },
    ]);

    const createDto = {
      eventId,
      items: [
        { ticketTypeId: 't1', quantity: 1 },
        { ticketTypeId: 'invalid', quantity: 1 },
      ],
    };

    await expect(service.create(orgId, userId, createDto)).rejects.toThrow(
      'One or more ticket types are invalid for this event',
    );
  });
});
