import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Patch,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import { MembersService } from './members.service';
import {
  ListMembersQueryDto,
  UpdateMemberRoleDto,
  CreateInviteDto,
  AcceptInviteDto,
} from './dto/member.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrganizationRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../common/types';

@Controller('members')
@UseGuards(AuthGuard('jwt'))
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.ADMIN)
  findAll(
    @Req() req: AuthenticatedRequest,

    @Query() query: ListMembersQueryDto,
  ) {
    return this.membersService.findAll(req.orgId!, query.skip, query.take);
  }

  @Post('invites')
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.ADMIN)
  createInvite(
    @Req() req: AuthenticatedRequest,

    @Body() dto: CreateInviteDto,
  ) {
    return this.membersService.createInvite(req.orgId!, req.user.id, dto);
  }

  @Post('invites/accept')
  acceptInvite(
    @Req() req: AuthenticatedRequest,

    @Body() dto: AcceptInviteDto,
  ) {
    return this.membersService.acceptInvite(req.user.id, dto);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.ADMIN)
  findOne(
    @Req() req: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.findOne(req.orgId!, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe) id: string,

    @Body() updateMemberDto: UpdateMemberRoleDto,
  ) {
    return this.membersService.update(req.orgId!, id, updateMemberDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.ADMIN)
  remove(
    @Req() req: AuthenticatedRequest,

    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.remove(req.orgId!, id);
  }
}
