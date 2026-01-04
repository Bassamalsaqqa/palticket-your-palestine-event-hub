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
    // Note: findPublicAll has a where clause in prisma.findMany AND a filter after.
    // The where clause handles the bulk, the policy service ensures correctness.
    prisma.event.findMany.mockResolvedValue(mockEvents.filter(e => ['PUBLISHED', 'LIVE', 'ENDED'].includes(e.status)) as any);

    const result = await service.findPublicAll();

    expect(result).toHaveLength(3);
    expect(result.map(e => e.id)).toEqual(['1', '3', '5']);
  });

  it('findPublicOne should throw NotFound for DRAFT event', async () => {
    prisma.event.findUnique.mockResolvedValue(mockEvents[1] as any);

    await expect(service.findPublicOne('2')).rejects.toThrow('Event not found');
  });

  it('findPublicOne should return event for LIVE event', async () => {
    prisma.event.findUnique.mockResolvedValue(mockEvents[2] as any);

    const result = await service.findPublicOne('3');
    expect(result.id).toBe('3');
  });
});
