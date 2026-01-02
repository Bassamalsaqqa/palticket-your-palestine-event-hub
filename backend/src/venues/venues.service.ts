import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/venue.dto';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: CreateVenueDto) {
    const { translations, ...venueData } = data;
    return this.prisma.venue.create({
      data: {
        ...venueData,
        organizationId,
        translations: {
          create: translations,
        },
      },
      select: {
        id: true,
        capacity: true,
        organizationId: true,
        translations: true,
      },
    });
  }

  async findAll(organizationId: string, lang = 'en', skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.venue.findMany({
      where: { organizationId },
      skip,
      take: limit,
      select: {
        id: true,
        capacity: true,
        organizationId: true,
        translations: {
          where: { locale: { in: [lang, 'en'] } },
          select: { locale: true, name: true, address: true, city: true },
        },
      },
    });
  }

  async findOne(organizationId: string, id: string, lang = 'en') {
    return this.prisma.venue.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        capacity: true,
        organizationId: true,
        translations: {
          where: { locale: { in: [lang, 'en'] } },
          select: { locale: true, name: true, address: true, city: true },
        },
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateVenueDto) {
    const { translations, ...venueData } = data;

    // Verify ownership
    await this.prisma.venue.findFirstOrThrow({
      where: { id, organizationId },
    });

    return this.prisma.venue.update({
      where: { id },
      data: {
        ...venueData,
        ...(translations && {
          translations: {
            upsert: translations.map((t) => ({
              where: { venueId_locale: { venueId: id, locale: t.locale } },
              update: {
                name: t.name,
                address: t.address,
                city: t.city,
              },
              create: {
                locale: t.locale,
                name: t.name,
                address: t.address,
                city: t.city,
              },
            })),
          },
        }),
      },
      select: {
        id: true,
        capacity: true,
        organizationId: true,
      },
    });
  }
}
