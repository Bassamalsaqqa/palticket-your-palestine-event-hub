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
import { ListMembersQueryDto, UpdateMemberRoleDto, InviteMemberDto } from './dto/member.dto';
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
  @Roles(OrganizationRole.ADMIN)
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListMembersQueryDto,
  ) {
    return this.membersService.findAll(req.orgId!, query.skip, query.take);
  }

  @Post('invite')
  @Roles(OrganizationRole.ADMIN)
  invite(
    @Req() req: AuthenticatedRequest,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.membersService.invite(req.orgId!, inviteMemberDto);
  }

  @Get(':id')
  @Roles(OrganizationRole.ADMIN)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.findOne(req.orgId!, id);
  }

  @Patch(':id')
  @Roles(OrganizationRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMemberDto: UpdateMemberRoleDto,
  ) {
    return this.membersService.update(req.orgId!, id, updateMemberDto);
  }

  @Delete(':id')
  @Roles(OrganizationRole.ADMIN)
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.remove(req.orgId!, id);
  }
}
