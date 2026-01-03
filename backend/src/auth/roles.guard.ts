import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedRequest } from '../common/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<OrganizationRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    let orgId = request.headers['x-organization-id'];

    if (Array.isArray(orgId)) {
      orgId = orgId[0];
    }

    if (!user || !orgId) {
      return false;
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (!member) {
      return false;
    }

    request.memberRole = member.role;
    request.memberId = member.id;
    request.orgId = orgId;

    return requiredRoles.includes(member.role);
  }
}
