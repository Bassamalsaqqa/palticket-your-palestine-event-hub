import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationRole } from '@prisma/client';
import { AuthenticatedRequest } from '../common/types';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { memberRole, memberId, orgId, body } = request;

    if (!memberRole || !memberId || !orgId) {
      // Should be caught by RolesGuard, but safe fallback
      return false;
    }

    // ORG_ADMIN bypasses all assignment checks
    if (memberRole === OrganizationRole.ORG_ADMIN) {
      return true;
    }

    const eventId = body?.eventId;
    const gateId = body?.gateId;

    if (eventId) {
      const assignment = await this.prisma.eventStaffAssignment.findUnique({
        where: {
          memberId_eventId: {
            memberId,
            eventId,
          },
        },
        select: { id: true },
      });

      if (!assignment) {
        throw new ForbiddenException(
          'You are not assigned to this event.',
        );
      }
    }

    if (gateId) {
      const assignment = await this.prisma.gateAssignment.findUnique({
        where: {
          memberId_gateId: {
            memberId,
            gateId,
          },
        },
        select: { id: true },
      });

      if (!assignment) {
        throw new ForbiddenException(
          'You are not assigned to this gate.',
        );
      }
    }

    return true;
  }
}
