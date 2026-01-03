import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConflictException } from '@nestjs/common';
import { OrganizationRole, InviteStatus } from '@prisma/client';
import { CreateInviteDto } from './dto/member.dto';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get(PrismaService);
  });

  const orgId = 'org-1';
  const userId = 'user-1';

  describe('createInvite', () => {
    it('should successfully create an invite', async () => {
      const dto: CreateInviteDto = {
        email: 'test@example.com',
        role: OrganizationRole.STAFF,
      };

      prisma.organizationMember.findFirst.mockResolvedValue(null);
      prisma.organizationInvite.findFirst.mockResolvedValue(null);
      prisma.organizationInvite.create.mockResolvedValue({
        id: 'invite-1',
        ...dto,
        token: 'token',
        expiresAt: new Date(),
        status: InviteStatus.PENDING,
      } as any);

      const result = await service.createInvite(orgId, userId, dto);

      expect(prisma.organizationMember.findFirst).toHaveBeenCalled();
      expect(prisma.organizationInvite.create).toHaveBeenCalled();
      expect(result.email).toBe(dto.email);
    });

    it('should throw ConflictException if user is already a member', async () => {
      const dto: CreateInviteDto = {
        email: 'test@example.com',
        role: OrganizationRole.STAFF,
      };

      prisma.organizationMember.findFirst.mockResolvedValue({
        id: 'mem-1',
      } as any);

      await expect(service.createInvite(orgId, userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    const memberId = 'mem-1';

    it('should successfully remove a member', async () => {
      prisma.organizationMember.findFirstOrThrow.mockResolvedValue({
        id: memberId,
      } as any);
      prisma.organizationMember.delete.mockResolvedValue({
        id: memberId,
      } as any);

      await service.remove(orgId, memberId);

      expect(prisma.organizationMember.findFirstOrThrow).toHaveBeenCalled();
      expect(prisma.organizationMember.delete).toHaveBeenCalled();
    });
  });
});
