import { IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationRole } from '@prisma/client';

export class ListMembersQueryDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  take?: number;
}

export class UpdateMemberRoleDto {
  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}
