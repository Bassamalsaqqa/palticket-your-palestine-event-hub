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
import { VenuesService } from './venues.service';
import {
  CreateVenueDto,
  UpdateVenueDto,
  ListVenuesQueryDto,
  GetVenueQueryDto,
} from './dto/venue.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('venues')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @Roles(OrganizationRole.ORG_ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createVenueDto: CreateVenueDto,
  ) {
    return this.venuesService.create(req.orgId!, createVenueDto);
  }

  @Get()
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListVenuesQueryDto,
  ) {
    return this.venuesService.findAll(
      req.orgId!,
      query.lang,
      query.skip,
      query.take,
    );
  }

  @Get(':id')
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetVenueQueryDto,
  ) {
    return this.venuesService.findOne(req.orgId!, id, query.lang);
  }

  @Put(':id')
  @Roles(OrganizationRole.ORG_ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    return this.venuesService.update(req.orgId!, id, updateVenueDto);
  }
}
