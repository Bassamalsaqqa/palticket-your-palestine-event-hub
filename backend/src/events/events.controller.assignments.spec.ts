import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { OrganizationRole } from '@prisma/client';
import { AuthenticatedRequest } from '../common/types';

describe('EventsController Assignments', () => {
  let controller: EventsController;
  let service: DeepMockProxy<EventsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockDeep<EventsService>(),
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: StorageService,
          useValue: mockDeep<StorageService>(),
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);
  });

  it('should call createAssignment with correct params', async () => {
    const req = { orgId: 'org-1' } as unknown as AuthenticatedRequest;
    const dto = { memberId: 'member-1', role: OrganizationRole.SELLER };
    
    await controller.createAssignment(req, 'event-1', dto);
    
    expect(service.createAssignment).toHaveBeenCalledWith('org-1', 'event-1', dto, undefined);
  });
});
