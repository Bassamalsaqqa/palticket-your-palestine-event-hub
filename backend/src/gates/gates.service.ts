import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGateDto, UpdateGateDto, CreateGateAssignmentDto } from './dto/gate.dto';

@Injectable()
export class GatesService {
  constructor(private prisma: PrismaService) {}

  async createAssignment(
    organizationId: string,
    gateId: string,
    data: CreateGateAssignmentDto,
  ) {
    // Verify gate exists and belongs to org
    await this.prisma.gate.findFirstOrThrow({
      where: { id: gateId, organizationId },
    });

    // Verify member exists and belongs to org
    await this.prisma.organizationMember.findFirstOrThrow({
      where: { id: data.memberId, organizationId },
    });

    const existing = await this.prisma.gateAssignment.findUnique({
      where: {
        memberId_gateId: {
          memberId: data.memberId,
          gateId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Member is already assigned to this gate');
    }

    return this.prisma.gateAssignment.create({
      data: {
        organizationId,
        gateId,
        memberId: data.memberId,
      },
      select: {
        id: true,
        gateId: true,
        memberId: true,
      },
    });
  }

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

    if (data.eventId) {
      await this.prisma.event.findFirstOrThrow({
        where: { id: data.eventId, organizationId },
      });
    }

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
