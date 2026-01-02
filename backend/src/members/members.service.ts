import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMemberRoleDto, CreateInviteDto, AcceptInviteDto } from './dto/member.dto';
import { InviteStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
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
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.organizationMember.findFirst({
      where: { id, organizationId },
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

  async createInvite(organizationId: string, invitedByUserId: string, dto: CreateInviteDto) {
    // 1. Check if user already a member
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email: dto.email }
      },
      select: { id: true }
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    // 2. Check if active invite already exists
    const existingInvite = await this.prisma.organizationInvite.findFirst({
      where: {
        organizationId,
        email: dto.email,
        status: InviteStatus.PENDING,
        expiresAt: { gt: new Date() }
      },
      select: { id: true }
    });

    if (existingInvite) {
      throw new ConflictException('An active invite already exists for this email');
    }

    // 3. Create invite
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    return this.prisma.organizationInvite.create({
      data: {
        organizationId,
        email: dto.email,
        role: dto.role,
        token,
        expiresAt,
        invitedByUserId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        token: true,
        expiresAt: true,
        status: true
      }
    });
  }

  async acceptInvite(userId: string, dto: AcceptInviteDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!user) throw new NotFoundException('User not found');

    const invite = await this.prisma.organizationInvite.findUnique({
      where: { token: dto.token },
      select: {
        id: true,
        organizationId: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true
      }
    });

    if (!invite || invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invalid or inactive invite');
    }

    if (invite.expiresAt < new Date()) {
      await this.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED }
      });
      throw new BadRequestException('Invite has expired');
    }

    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new BadRequestException('Invite was sent to a different email address');
    }

    return this.prisma.$transaction(async (tx) => {
      const existingMember = await tx.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: invite.organizationId,
            userId: user.id,
          },
        },
        select: {
          id: true,
          organization: { select: { name: true } },
        },
      });

      if (existingMember) {
        await tx.organizationInvite.update({
          where: { id: invite.id },
          data: { status: InviteStatus.ACCEPTED }
        });
        return existingMember;
      }

      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.ACCEPTED }
      });

      return tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: user.id,
          role: invite.role,
        },
        select: {
          id: true,
          organization: { select: { name: true } }
        }
      });
    });
  }

  async remove(organizationId: string, id: string) {
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