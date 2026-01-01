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
import { GatesService } from './gates.service';
import {
  CreateGateDto,
  UpdateGateDto,
  ListGatesQueryDto,
} from './dto/gate.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('gates')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class GatesController {
  constructor(private readonly gatesService: GatesService) {}

  @Post()
  @Roles(OrganizationRole.ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createGateDto: CreateGateDto,
  ) {
    return this.gatesService.create(req.orgId!, createGateDto);
  }

  @Get()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findAll(@Req() req: AuthenticatedRequest, @Query() query: ListGatesQueryDto) {
    return this.gatesService.findAll(
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
    return this.gatesService.findOne(req.orgId!, id);
  }

  @Put(':id')
  @Roles(OrganizationRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGateDto: UpdateGateDto,
  ) {
    return this.gatesService.update(req.orgId!, id, updateGateDto);
  }
}
