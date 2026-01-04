import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, CreateEventAssignmentDto } from './dto/event.dto';
import { StorageService } from '../common/storage.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private eventPolicy: EventPolicyService,
  ) {}

  async createAssignment(
    organizationId: string,
    eventId: string,
    data: CreateEventAssignmentDto,
  ) {
    // Verify event exists and belongs to org
    await this.prisma.event.findFirstOrThrow({
      where: { id: eventId, organizationId },
      select: { id: true },
    });

    // Verify member exists and belongs to org
    await this.prisma.organizationMember.findFirstOrThrow({
      where: { id: data.memberId, organizationId },
      select: { id: true },
    });

    const existing = await this.prisma.eventStaffAssignment.findUnique({
      where: {
        memberId_eventId: {
          memberId: data.memberId,
          eventId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Member is already assigned to this event');
    }

    return this.prisma.eventStaffAssignment.create({
      data: {
        organizationId,
        eventId,
        memberId: data.memberId,
        role: data.role,
      },
      select: {
        id: true,
        eventId: true,
        memberId: true,
        role: true,
      },
    });
  }

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
        imageUrl: true,
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
    const events = await this.prisma.event.findMany({
      where: { organizationId },
      skip,
      take: limit,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        slug: true,
        imageUrl: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: {
          where: { locale: { in: [lang, 'en'] } },
          select: {
            locale: true,
            name: true,
            summary: true,
            description: true,
          },
        },
        category: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true },
            },
          },
        },
        city: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true },
            },
          },
        },
        venue: {
          select: {
            id: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true, address: true, city: true },
            },
          },
        },
      },
    });

    return events.filter((e) => this.eventPolicy.isPublicVisible(e));
  }

  async findOne(organizationId: string, id: string, lang = 'en') {
    return this.prisma.event.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        slug: true,
        imageUrl: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: {
          where: { locale: { in: [lang, 'en'] } },
          select: {
            locale: true,
            name: true,
            summary: true,
            description: true,
          },
        },
        category: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true },
            },
          },
        },
        city: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true },
            },
          },
        },
        venue: {
          select: {
            id: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
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
        imageUrl: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: {
          where: { locale: { in: [lang, 'en'] } },
          select: {
            locale: true,
            name: true,
            summary: true,
            description: true,
          },
        },
        category: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true },
            },
          },
        },
        city: {
          select: {
            slug: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true },
            },
          },
        },
        venue: {
          select: {
            id: true,
            translations: {
              where: { locale: { in: [lang, 'en'] } },
              select: { locale: true, name: true, address: true, city: true },
            },
          },
        },
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateEventDto, actorMemberId?: string) {
    const { translations, ...eventData } = data;

    // Verify ownership
    const event = await this.prisma.event.findFirstOrThrow({
      where: { id, organizationId },
      select: { id: true, status: true },
    });

    const updated = await this.prisma.event.update({
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
        imageUrl: true,
        startTime: true,
        endTime: true,
        status: true,
        translations: true,
        venueId: true,
        categoryId: true,
        cityId: true,
      },
    });

    if (data.status && data.status !== event.status) {
      await this.prisma.auditLog.create({
        data: {
          organizationId,
          actorMemberId,
          action: 'EVENT_STATUS_UPDATE',
          entityType: 'Event',
          entityId: id,
          metadata: { oldStatus: event.status, newStatus: updated.status },
        },
      });
    }

    return updated;
  }

  async uploadImage(
    organizationId: string,
    id: string,
    file: { buffer: Buffer; originalname: string },
  ) {
    const event = await this.prisma.event.findFirst({
      where: { id, organizationId },
    });

    if (!event) {
      throw new BadRequestException('Event not found or access denied');
    }

    if (!file || !file.buffer) {
      throw new BadRequestException('No image file provided');
    }

    const relativePath = this.storageService.buildEventAssetPath(
      event.startTime,
      event.slug,
    );

    const fileName = `${Date.now()}-${file.originalname}`;
    const imageUrl = this.storageService.store(
      file.buffer,
      fileName,
      relativePath,
    );
    return this.prisma.event.update({
      where: { id },
      data: { imageUrl },
      select: {
        id: true,
        imageUrl: true,
      },
    });
  }
}
