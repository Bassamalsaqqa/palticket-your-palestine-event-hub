import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    organizationMember: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invite', () => {
    const orgId = 'org-1';
    const dto = { email: 'test@example.com', role: OrganizationRole.STAFF };
    const user = { id: 'user-1', email: dto.email };

    it('should successfully invite a user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.organizationMember.findUnique.mockResolvedValue(null);
      mockPrismaService.organizationMember.create.mockResolvedValue({
        id: 'mem-1',
        organizationId: orgId,
        userId: user.id,
        role: dto.role,
        user,
      });

      const result = await service.invite(orgId, dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(prisma.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          organizationId_userId: { organizationId: orgId, userId: user.id },
        },
      });
      expect(prisma.organizationMember.create).toHaveBeenCalledWith({
        data: {
          organizationId: orgId,
          userId: user.id,
          role: dto.role,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              createdAt: true,
            },
          },
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.invite(orgId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if user is already a member', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.organizationMember.findUnique.mockResolvedValue({ id: 'mem-1' });

      await expect(service.invite(orgId, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    const orgId = 'org-1';
    const memberId = 'mem-1';

    it('should successfully remove a member', async () => {
      mockPrismaService.organizationMember.findFirstOrThrow.mockResolvedValue({ id: memberId });
      mockPrismaService.organizationMember.delete.mockResolvedValue({ id: memberId });

      await service.remove(orgId, memberId);

      expect(prisma.organizationMember.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: memberId, organizationId: orgId },
      });
      expect(prisma.organizationMember.delete).toHaveBeenCalledWith({
        where: { id: memberId },
      });
    });

    // prisma.findFirstOrThrow throws automatically if not found, so we don't need to assert it explicitly here
    // unless we mock it to throw.
    it('should propagate error if member not found', async () => {
      mockPrismaService.organizationMember.findFirstOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.remove(orgId, memberId)).rejects.toThrow('Not found');
    });
  });
});
