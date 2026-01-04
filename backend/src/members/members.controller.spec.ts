import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('MembersController', () => {
  let controller: MembersController;
  let service: DeepMockProxy<MembersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockDeep<MembersService>(),
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    service = module.get(MembersService);
  });

  it('should call findAll with pagination params', async () => {
    const req = { orgId: 'org-1', user: { id: 'user-1' } } as any;
    const query = { skip: 10, take: 5 };
    
    await controller.findAll(req, query);
    
    expect(service.findAll).toHaveBeenCalledWith('org-1', 10, 5);
  });

  it('should call acceptInvite with userId', async () => {
    const req = { user: { id: 'user-1' } } as any; // No orgId needed
    const dto = { token: 'token-123' };
    
    await controller.acceptInvite(req, dto);
    
    expect(service.acceptInvite).toHaveBeenCalledWith('user-1', dto);
  });
});
