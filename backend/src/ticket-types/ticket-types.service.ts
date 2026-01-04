import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
  CreatePriceVersionDto,
} from './dto/ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

  async createPriceVersion(
    organizationId: string,
    ticketTypeId: string,
    dto: CreatePriceVersionDto,
    createdByMemberId?: string,
  ) {
    const { startsAt, endsAt, ...data } = dto;

    // 1. Verify ticket type belongs to org
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id: ticketTypeId, event: { organizationId } },
      select: { id: true },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    const start = startsAt ? new Date(startsAt) : new Date();
    const end = endsAt ? new Date(endsAt) : null;

    if (end && end <= start) {
      throw new BadRequestException('endsAt must be greater than startsAt');
    }

    // 2. Check for overlapping ranges for same ticketType + currency
    // Overlap if: max(start1, start2) < min(end1, end2)
    const overlapping = await this.prisma.ticketTypePriceVersion.findFirst({
      where: {
        ticketTypeId,
        currency: data.currency,
        AND: [
          {
            OR: [{ endsAt: null }, { endsAt: { gt: start } }],
          },
          ...(end
            ? [
                {
                  startsAt: { lt: end },
                },
              ]
            : []),
        ],
      },
      select: { id: true },
    });

    if (overlapping) {
      throw new BadRequestException(
        'Price version range overlaps with an existing version',
      );
    }

    const version = await this.prisma.ticketTypePriceVersion.create({
      data: {
        ...data,
        ticketTypeId,
        startsAt: start,
        endsAt: end,
        createdByMemberId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorMemberId: createdByMemberId,
        action: 'PRICE_VERSION_CREATE',
        entityType: 'TicketTypePriceVersion',
        entityId: version.id,
        metadata: {
          ticketTypeId,
          priceCents: data.priceCents,
          currency: data.currency,
        },
      },
    });

    return version;
  }

  async findPriceVersions(
    organizationId: string,
    ticketTypeId: string,
    skip = 0,
    take = 20,
  ) {
    const limit = Math.min(take, 100);

    // Verify ownership
    const ticketType = await this.prisma.ticketType.findFirst({
      where: { id: ticketTypeId, event: { organizationId } },
      select: { id: true },
    });

    if (!ticketType) {
      throw new NotFoundException('Ticket type not found');
    }

    return this.prisma.ticketTypePriceVersion.findMany({
      where: { ticketTypeId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(organizationId: string, data: CreateTicketTypeDto) {
    await this.prisma.event.findFirstOrThrow({
      where: { id: data.eventId, organizationId },
    });

    return this.prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.create({
        data,
        select: {
          id: true,
          name: true,
          sellPriceCents: true,
          partnerPriceCents: true,
          currency: true,
          quantity: true,
          eventId: true,
        },
      });

      await tx.ticketTypeInventory.create({
        data: {
          organizationId,
          ticketTypeId: ticketType.id,
          capacity: data.quantity,
          sold: 0,
          reserved: 0,
        },
      });

      return ticketType;
    });
  }

  async findAll(organizationId: string, eventId?: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.ticketType.findMany({
      where: {
        event: { organizationId },
        ...(eventId ? { eventId } : {}),
      },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        sellPriceCents: true,
        partnerPriceCents: true,
        currency: true,
        quantity: true,
        eventId: true,
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.ticketType.findFirst({
      where: { id, event: { organizationId } },
      select: {
        id: true,
        name: true,
        sellPriceCents: true,
        partnerPriceCents: true,
        currency: true,
        quantity: true,
        eventId: true,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateTicketTypeDto) {
    await this.prisma.ticketType.findFirstOrThrow({
      where: { id, event: { organizationId } },
    });

    return this.prisma.ticketType.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        sellPriceCents: true,
        partnerPriceCents: true,
        currency: true,
        quantity: true,
        eventId: true,
      },
    });
  }
}
