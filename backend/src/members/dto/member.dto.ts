import { IsOptional, IsInt, Min, IsEnum, IsEmail, IsNotEmpty } from 'class-validator';
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

export class InviteMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(OrganizationRole)
  role: OrganizationRole;
}
