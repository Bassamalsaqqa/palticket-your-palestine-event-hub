import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrdersService } from './orders.service';
import { ListOrdersQueryDto } from './dto/order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  @UseInterceptors(IdempotencyInterceptor)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.orgId!, req.user.id, createOrderDto);
  }

  @Get()
  @Roles(OrganizationRole.ORG_ADMIN, OrganizationRole.SELLER) // temporary compatibility until Phase-1 ScopeGuard/assignments
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.ordersService.findAll(
      req.orgId!,
      query.eventId,
      query.userId,
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
    return this.ordersService.findOne(req.orgId!, id);
  }
}
