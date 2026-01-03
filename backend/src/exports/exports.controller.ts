import { Controller, Get, UseGuards, Req, Query, Header } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';
import { ExportQueryDto } from './dto/exports.dto';

@Controller('exports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('orders.csv')
  @Roles(OrganizationRole.ADMIN)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  async exportOrders(
    @Req() req: AuthenticatedRequest,
    @Query() query: ExportQueryDto,
  ) {
    return await this.exportsService.exportOrders(
      req.orgId!,
      req.memberId!,
      query.eventId,
    );
  }

  @Get('tickets.csv')
  @Roles(OrganizationRole.ADMIN)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="tickets.csv"')
  async exportTickets(
    @Req() req: AuthenticatedRequest,
    @Query() query: ExportQueryDto,
  ) {
    return await this.exportsService.exportTickets(
      req.orgId!,
      req.memberId!,
      query.eventId,
    );
  }
}
