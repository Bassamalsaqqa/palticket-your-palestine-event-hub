import { SetMetadata } from '@nestjs/common';
import { OrganizationRole } from '@prisma/client';

export const Roles = (...roles: OrganizationRole[]) =>
  SetMetadata('roles', roles);
