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
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles(OrganizationRole.ORG_ADMIN)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListMembersQueryDto,
  ) {
    return this.membersService.findAll(req.orgId!, query.skip, query.take);
  }

  @Post('invites/accept')
  acceptInvite(
    @Req() req: AuthenticatedRequest,
    @Body() acceptInviteDto: AcceptInviteDto,
  ) {
    return this.membersService.acceptInvite(req.user.id, acceptInviteDto);
  }

  @Get(':id')
  @Roles(OrganizationRole.ORG_ADMIN)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.findOne(req.orgId!, id);
  }

  @Post('invites')
  @Roles(OrganizationRole.ORG_ADMIN)
  createInvite(
    @Req() req: AuthenticatedRequest,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.membersService.createInvite(
      req.orgId!,
      req.user.id,
      createInviteDto,
    );
  }

  @Patch(':id')
  @Roles(OrganizationRole.ORG_ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    return this.membersService.update(req.orgId!, id, updateMemberRoleDto, req.memberId);
  }

  @Delete(':id')
  @Roles(OrganizationRole.ORG_ADMIN)
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.remove(req.orgId!, id);
  }
}
