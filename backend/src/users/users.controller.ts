import {
  Controller,
  Get,
  Request,
  UseGuards,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return await this.usersService.findOne(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  @Roles(OrganizationRole.ORG_ADMIN)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(req.orgId!, id, updateUserDto);
  }
}
