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
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersQueryDto } from './dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import { AuthenticatedRequest } from '../common/types';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(req.orgId!, req.user.id, createOrderDto);
  }

  @Get()
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.ordersService.findAll(
      req.orgId!,
      query.eventId,
      query.skip,
      query.take,
    );
  }

  @Get(':id')
  @Roles(OrganizationRole.ADMIN, OrganizationRole.STAFF)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findOne(req.orgId!, id);
  }
}
