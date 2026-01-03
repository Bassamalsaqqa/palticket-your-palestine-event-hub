import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import { OpsService } from './ops.service';
import { CreatePosOrderDto } from './dto/pos-order.dto';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import type { AuthenticatedRequest } from '../common/types';

@Controller('ops')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  @Post('orders')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF) // SELLER later
  @UseInterceptors(IdempotencyInterceptor)
  createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePosOrderDto,
  ) {
    return this.opsService.createPosOrder(req.orgId!, req.user.id, dto);
  }
}
