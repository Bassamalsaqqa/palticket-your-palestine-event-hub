import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
} from './dto/ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: CreateTicketTypeDto) {
    await this.prisma.event.findFirstOrThrow({
      where: { id: data.eventId, organizationId },
    });

    return this.prisma.ticketType.create({
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
