import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGateDto, UpdateGateDto } from './dto/gate.dto';

@Injectable()
export class GatesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: CreateGateDto) {
    await this.prisma.event.findFirstOrThrow({
      where: { id: data.eventId, organizationId },
    });

    return this.prisma.gate.create({
      data: {
        ...data,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        eventId: true,
      },
    });
  }

  async findAll(organizationId: string, eventId?: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.gate.findMany({
      where: {
        organizationId,
        ...(eventId ? { eventId } : {}),
      },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        eventId: true,
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.gate.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        eventId: true,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateGateDto) {
    await this.prisma.gate.findFirstOrThrow({
      where: { id, organizationId },
    });

    return this.prisma.gate.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        eventId: true,
      },
    });
  }
}
