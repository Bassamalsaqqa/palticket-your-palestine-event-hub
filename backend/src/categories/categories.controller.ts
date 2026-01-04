import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ListTaxonomyQueryDto } from './dto/category.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTaxonomyQueryDto,
  ) {
    return this.categoriesService.findAll(
      req.orgId!,
      query.lang,
      query.skip,
      query.take,
    );
  }
}
