import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TicketTypesService } from './ticket-types.service';
import {
  CreateTicketTypeDto,
  UpdateTicketTypeDto,
  ListTicketTypesQueryDto,
} from './dto/ticket-type.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('ticket-types')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post()
  @Roles(OrganizationRole.ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createTicketTypeDto: CreateTicketTypeDto,
  ) {
    return this.ticketTypesService.create(req.orgId!, createTicketTypeDto);
  }

  @Get()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTicketTypesQueryDto,
  ) {
    return this.ticketTypesService.findAll(
      req.orgId!,
      query.eventId,
      query.skip,
      query.take,
    );
  }

  @Get(':id')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ticketTypesService.findOne(req.orgId!, id);
  }

  @Put(':id')
  @Roles(OrganizationRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
  ) {
    return this.ticketTypesService.update(req.orgId!, id, updateTicketTypeDto);
  }
}
