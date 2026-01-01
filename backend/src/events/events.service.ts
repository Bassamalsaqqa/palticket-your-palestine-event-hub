import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...data,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        venueId: true,
      },
    });
  }

  async findAll(organizationId: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.event.findMany({
      where: { organizationId },
      skip,
      take: limit,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        venueId: true,
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.event.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        venueId: true,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateEventDto) {
    await this.prisma.event.findFirstOrThrow({
      where: { id, organizationId },
    });

    return this.prisma.event.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        startTime: true,
        endTime: true,
        status: true,
        venueId: true,
      },
    });
  }
}
