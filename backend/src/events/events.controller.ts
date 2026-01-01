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
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  ListEventsQueryDto,
} from './dto/event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import { AuthenticatedRequest } from '../common/types';

@Controller('events')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(OrganizationRole.ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(req.orgId!, createEventDto);
  }

  @Get()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListEventsQueryDto,
  ) {
    return this.eventsService.findAll(req.orgId!, query.skip, query.take);
  }

  @Get(':id')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.eventsService.findOne(req.orgId!, id);
  }

  @Put(':id')
  @Roles(OrganizationRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(req.orgId!, id, updateEventDto);
  }
}
