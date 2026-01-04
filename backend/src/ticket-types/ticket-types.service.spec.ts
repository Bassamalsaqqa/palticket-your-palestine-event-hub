import { Test, TestingModule } from '@nestjs/testing';
import { TicketTypesService } from './ticket-types.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketType, TicketTypePriceVersion } from '@prisma/client';

describe('TicketTypesService', () => {
  let service: TicketTypesService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketTypesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<TicketTypesService>(TicketTypesService);
    prisma = module.get(PrismaService);
  });

  const orgId = 'org-1';
  const ticketTypeId = 'tt-1';

  describe('createPriceVersion', () => {
    it('should create a price version successfully', async () => {
      const dto = {
        currency: 'ILS',
        priceCents: 1500,
        startsAt: new Date(Date.now() + 1000).toISOString(),
        reason: 'Holiday pricing',
      };

      prisma.ticketType.findFirst.mockResolvedValue({ id: ticketTypeId } as TicketType);
      prisma.ticketTypePriceVersion.findFirst.mockResolvedValue(null);
      prisma.ticketTypePriceVersion.create.mockResolvedValue({ id: 'pv-1', ...dto } as TicketTypePriceVersion);

      const result = await service.createPriceVersion(orgId, ticketTypeId, dto);

      expect(result.id).toBe('pv-1');
      expect(prisma.ticketTypePriceVersion.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if ticket type not found', async () => {
      prisma.ticketType.findFirst.mockResolvedValue(null);

      await expect(
        service.createPriceVersion(orgId, ticketTypeId, {
          currency: 'ILS',
          priceCents: 1000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if endsAt <= startsAt', async () => {
      const now = new Date();
      const dto = {
        currency: 'ILS',
        priceCents: 1500,
        startsAt: now.toISOString(),
        endsAt: now.toISOString(),
      };

      prisma.ticketType.findFirst.mockResolvedValue({ id: ticketTypeId } as TicketType);

      await expect(
        service.createPriceVersion(orgId, ticketTypeId, dto),
      ).rejects.toThrow('endsAt must be greater than startsAt');
    });

    it('should throw BadRequestException if ranges overlap', async () => {
      const dto = {
        currency: 'ILS',
        priceCents: 1500,
        startsAt: new Date(Date.now() + 1000).toISOString(),
      };

      prisma.ticketType.findFirst.mockResolvedValue({ id: ticketTypeId } as TicketType);
      prisma.ticketTypePriceVersion.findFirst.mockResolvedValue({ id: 'existing-pv' } as TicketTypePriceVersion);

      await expect(
        service.createPriceVersion(orgId, ticketTypeId, dto),
      ).rejects.toThrow('Price version range overlaps with an existing version');
    });
  });
});
