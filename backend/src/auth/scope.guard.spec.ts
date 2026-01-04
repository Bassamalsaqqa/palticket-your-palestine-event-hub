import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeGuard } from './scope.guard';

describe('ScopeGuard', () => {
  let guard: ScopeGuard;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    guard = new ScopeGuard(prisma);
  });

  const createMockContext = (
    userRole: OrganizationRole,
    body: Record<string, unknown> = {},
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          memberRole: userRole,
          memberId: 'member-1',
          orgId: 'org-1',
          body,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow ORG_ADMIN to bypass assignment checks', async () => {
    const context = createMockContext(OrganizationRole.ORG_ADMIN, {
      eventId: 'event-1',
    });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prisma.eventStaffAssignment.findUnique).not.toHaveBeenCalled();
  });

  it('should allow SELLER with assignment', async () => {
    prisma.eventStaffAssignment.findUnique.mockResolvedValue({ id: 'assign-1' });
    const context = createMockContext(OrganizationRole.SELLER, {
      eventId: 'event-1',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(prisma.eventStaffAssignment.findUnique).toHaveBeenCalledWith({
      where: { memberId_eventId: { memberId: 'member-1', eventId: 'event-1' } },
      select: { id: true },
    });
  });

  it('should deny SELLER without assignment', async () => {
    prisma.eventStaffAssignment.findUnique.mockResolvedValue(null);
    const context = createMockContext(OrganizationRole.SELLER, {
      eventId: 'event-1',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should deny SCANNER without gate assignment when gateId is present', async () => {
    prisma.eventStaffAssignment.findUnique.mockResolvedValue({ id: 'assign-1' });
    prisma.gateAssignment.findUnique.mockResolvedValue(null);

    const context = createMockContext(OrganizationRole.SCANNER, {
      eventId: 'event-1',
      gateId: 'gate-1',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow SCANNER with both assignments', async () => {
    prisma.eventStaffAssignment.findUnique.mockResolvedValue({ id: 'assign-1' });
    prisma.gateAssignment.findUnique.mockResolvedValue({ id: 'gate-assign-1' });

    const context = createMockContext(OrganizationRole.SCANNER, {
      eventId: 'event-1',
      gateId: 'gate-1',
    });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
