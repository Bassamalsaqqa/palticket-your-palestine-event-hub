import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventPolicyService } from './event-policy.service';
import { StorageService } from '../common/storage.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { EventStatus } from '@prisma/client';

describe('EventsService Public', () => {
  let service: EventsService;
  let prisma: DeepMockProxy<PrismaService>;
  let eventPolicy: EventPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: StorageService,
          useValue: mockDeep<StorageService>(),
        },
        EventPolicyService,
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get(PrismaService);
    eventPolicy = module.get(EventPolicyService);
  });

  const mockEvents = [
    { id: '1', status: EventStatus.PUBLISHED, translations: [], category: null, city: null, venue: null, startTime: new Date() },
    { id: '2', status: EventStatus.DRAFT, translations: [], category: null, city: null, venue: null, startTime: new Date() },
    { id: '3', status: EventStatus.LIVE, translations: [], category: null, city: null, venue: null, startTime: new Date() },
    { id: '4', status: EventStatus.CANCELLED, translations: [], category: null, city: null, venue: null, startTime: new Date() },
    { id: '5', status: EventStatus.ENDED, translations: [], category: null, city: null, venue: null, startTime: new Date() },
  ];

  it('findPublicAll should only return visible events (PUBLISHED, LIVE, ENDED)', async () => {
    prisma.event.findMany.mockResolvedValue(mockEvents.filter(e => ['PUBLISHED', 'LIVE', 'ENDED'].includes(e.status)) as any);

    const result = await service.findPublicAll('en', 0, 20, 'pal-ticket');

    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(['1', '3', '5']);
  });

  it('findPublicOne should throw NotFound for DRAFT event', async () => {
    prisma.event.findFirst.mockResolvedValue(null);

    await expect(service.findPublicOne('2')).rejects.toThrow('Event not found');
  });

  it('findPublicOne should return event for LIVE event', async () => {
    prisma.event.findFirst.mockResolvedValue(mockEvents[2] as any);

    const result = await service.findPublicOne('3', 'en', 'pal-ticket');
    expect(result.id).toBe('3');
  });

  it('findPublicBySlug should require organizationSlug', async () => {
    await expect(service.findPublicBySlug('event-1')).rejects.toThrow(
      'organizationSlug is required',
    );
  });
});
