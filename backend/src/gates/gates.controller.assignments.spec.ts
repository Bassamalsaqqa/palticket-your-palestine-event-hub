import { Test, TestingModule } from '@nestjs/testing';
import { GatesController } from './gates.controller';
import { GatesService } from './gates.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AuthenticatedRequest } from '../common/types';

describe('GatesController Assignments', () => {
  let controller: GatesController;
  let service: DeepMockProxy<GatesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatesController],
      providers: [
        {
          provide: GatesService,
          useValue: mockDeep<GatesService>(),
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    controller = module.get<GatesController>(GatesController);
    service = module.get(GatesService);
  });

  it('should call createAssignment with correct params', async () => {
    const req = { orgId: 'org-1' } as unknown as AuthenticatedRequest;
    const dto = { memberId: 'member-1' };
    
    await controller.createAssignment(req, 'gate-1', dto);
    
    expect(service.createAssignment).toHaveBeenCalledWith('org-1', 'gate-1', dto, undefined);
  });
});
