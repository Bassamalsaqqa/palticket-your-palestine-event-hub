import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { ListTaxonomyQueryDto } from './dto/city.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import { AuthenticatedRequest } from '../common/types';

@Controller('cities')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTaxonomyQueryDto,
  ) {
    return this.citiesService.findAll(
      req.orgId!,
      query.lang,
      query.skip,
      query.take,
    );
  }
}
