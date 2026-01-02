import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberRoleDto, InviteMemberDto } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
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
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.organizationMember.findFirst({
      where: { id, organizationId },
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
  }

  async invite(organizationId: string, dto: InviteMemberDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${dto.email} not found. Please ask them to sign up first.`);
    }

    // 2. Check if already a member
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id,
        },
      },
      select: { id: true },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    // 3. Create member
    return this.prisma.organizationMember.create({
      data: {
        organizationId,
        userId: user.id,
        role: dto.role,
      },
      select: {
        id: true,
        organizationId: true,
        userId: true,
        role: true,
        createdAt: true,
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
  }

  async remove(organizationId: string, id: string) {
    // Ensure member exists and belongs to org
    await this.prisma.organizationMember.findFirstOrThrow({
      where: { id, organizationId },
      select: { id: true },
    });

    return this.prisma.organizationMember.delete({
      where: { id },
      select: {
        id: true,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateMemberRoleDto) {
    await this.prisma.organizationMember.findFirstOrThrow({
      where: { id, organizationId },
      select: { id: true },
    });

    return this.prisma.organizationMember.update({
      where: { id },
      data,
      select: {
        id: true,
        organizationId: true,
        userId: true,
        role: true,
        createdAt: true,
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
  }
}
