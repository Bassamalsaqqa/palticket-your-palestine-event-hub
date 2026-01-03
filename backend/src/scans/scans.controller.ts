import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ScansService } from './scans.service';
import { ScanRequestDto, ListScanLogsQueryDto } from './dto/scan.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('scan')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  scan(@Req() req: AuthenticatedRequest, @Body() body: ScanRequestDto) {
    return this.scansService.scan(req.orgId!, req.user.id, body);
  }

  @Get('logs')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findLogs(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListScanLogsQueryDto,
  ) {
    return this.scansService.findScanLogs(req.orgId!, query);
  }
}
