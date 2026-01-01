import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: CreateEventDto) {
    const { translations, ...eventData } = data;
    return this.prisma.event.create({
      data: {
        ...eventData,
        organizationId,
        translations: {
          create: translations,
        },
      },
      select: {
        id: true,
        slug: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: true,
        venueId: true,
        categoryId: true,
        cityId: true,
      },
    });
  }

  async findAll(organizationId: string, lang = 'en', skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.event.findMany({
      where: { organizationId },
      skip,
      take: limit,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        slug: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: {
          where: { locale: { in: [lang, "en"] } },
          select: { locale: true, name: true, summary: true, description: true },
        },
        category: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true },
            },
          },
        },
        city: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true },
            },
          },
        },
        venue: {
          select: {
            id: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true, address: true, city: true },
            },
          },
        },
      },
    });
  }

  async findOne(organizationId: string, id: string, lang = 'en') {
    return this.prisma.event.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        slug: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: {
          where: { locale: { in: [lang, "en"] } },
          select: { locale: true, name: true, summary: true, description: true },
        },
        category: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true },
            },
          },
        },
        city: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true },
            },
          },
        },
        venue: {
          select: {
            id: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true, address: true, city: true },
            },
          },
        },
      },
    });
  }

  async findBySlug(organizationId: string, slug: string, lang = 'en') {
    return this.prisma.event.findFirst({
      where: { slug, organizationId },
      select: {
        id: true,
        slug: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: {
          where: { locale: { in: [lang, "en"] } },
          select: { locale: true, name: true, summary: true, description: true },
        },
        category: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true },
            },
          },
        },
        city: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true },
            },
          },
        },
        venue: {
          select: {
            id: true,
            translations: {
              where: { locale: { in: [lang, "en"] } },
              select: { locale: true, name: true, address: true, city: true },
            },
          },
        },
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateEventDto) {
    const { translations, ...eventData } = data;

    // Verify ownership
    await this.prisma.event.findFirstOrThrow({
      where: { id, organizationId },
    });

    return this.prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        ...(translations && {
          translations: {
            upsert: translations.map((t) => ({
              where: { eventId_locale: { eventId: id, locale: t.locale } },
              update: {
                name: t.name,
                description: t.description,
                summary: t.summary,
              },
              create: {
                locale: t.locale,
                name: t.name,
                description: t.description,
                summary: t.summary,
              },
            })),
          },
        }),
      },
      select: {
        id: true,
        slug: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: true,
        venueId: true,
        categoryId: true,
        cityId: true,
      },
    });
  }
}
