import { Controller, Get, UseGuards, Req, Res, Header } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';
import { Response } from 'express';

@Controller('exports')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('orders.csv')
  @Roles(OrganizationRole.ADMIN)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  async exportOrders(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const csv = await this.exportsService.exportOrders(req.orgId!);
    return res.send(csv);
  }

  @Get('tickets.csv')
  @Roles(OrganizationRole.ADMIN)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="tickets.csv"')
  async exportTickets(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const csv = await this.exportsService.exportTickets(req.orgId!);
    return res.send(csv);
  }
}
