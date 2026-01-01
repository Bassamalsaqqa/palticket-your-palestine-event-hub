import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ListMembersQueryDto } from './dto/member.dto';
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

  @Get(':id')
  @Roles(OrganizationRole.ADMIN)
  findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.findOne(req.orgId!, id);
  }
}
