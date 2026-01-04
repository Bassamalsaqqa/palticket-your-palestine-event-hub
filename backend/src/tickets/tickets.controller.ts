import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ListTicketsQueryDto } from './dto/ticket.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('tickets')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTicketsQueryDto,
  ) {
    return this.ticketsService.findAll(
      req.orgId!,
      query.eventId,
      undefined,
      query.userId,
      query.skip,
      query.take,
    );
  }

  @Get(':id')
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ticketsService.findOne(req.orgId!, id);
  }
}
