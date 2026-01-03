import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  Param,
  ParseUUIDPipe,
  BadRequestException,
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
    if (!req.headers['idempotency-key']) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return this.opsService.createPosOrder(req.orgId!, req.user.id, dto);
  }

  @Post('orders/:id/confirm-payment')
  @Roles(OrganizationRole.ADMIN) // Restricted to ADMIN (Finance)
  confirmPayment(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.opsService.confirmPayment(req.orgId!, id, req.user.id);
  }
}
