import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '../common/types';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.organizationsService.findAllForUser(req.user.id);
  }
}
