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
  CreateGateAssignmentDto,
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

  @Post(':id/assignments')
  @Roles(OrganizationRole.ORG_ADMIN)
  createAssignment(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateGateAssignmentDto,
  ) {
    return this.gatesService.createAssignment(req.orgId!, id, dto);
  }

  @Post()
  @Roles(OrganizationRole.ORG_ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createGateDto: CreateGateDto,
  ) {
    return this.gatesService.create(req.orgId!, createGateDto);
  }

  @Get()
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findAll(@Req() req: AuthenticatedRequest, @Query() query: ListGatesQueryDto) {
    return this.gatesService.findAll(
      req.orgId!,
      query.eventId,
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
    return this.gatesService.findOne(req.orgId!, id);
  }

  @Put(':id')
  @Roles(OrganizationRole.ORG_ADMIN) // temporary compatibility until Phase-1 ScopeGuard/assignments
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGateDto: UpdateGateDto,
  ) {
    return this.gatesService.update(req.orgId!, id, updateGateDto);
  }
}
