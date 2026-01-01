import { Request } from 'express';
import { OrganizationRole } from '@prisma/client';

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user: SafeUser;
  memberRole?: OrganizationRole;
  orgId?: string;
}
