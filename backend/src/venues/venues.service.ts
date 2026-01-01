import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: CreateVenueDto) {
    return this.prisma.venue.create({
      data: {
        ...data,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        capacity: true,
      },
    });
  }

  async findAll(organizationId: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.venue.findMany({
      where: { organizationId },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        address: true,
        capacity: true,
      },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.venue.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        name: true,
        address: true,
        capacity: true,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateVenueDto) {
    await this.prisma.venue.findFirstOrThrow({
      where: { id, organizationId },
    });

    return this.prisma.venue.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        address: true,
        capacity: true,
      },
    });
  }
}
