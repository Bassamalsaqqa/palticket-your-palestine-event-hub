import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, OrganizationRole } from '@prisma/client';

export class EventTranslationDto {
  @IsIn(['en', 'ar'])
  locale: 'en' | 'ar';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class CreateEventDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EventTranslationDto)
  translations: EventTranslationDto[];

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsUUID()
  @IsOptional()
  venueId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  cityId?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;
}

export class UpdateEventDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EventTranslationDto)
  translations?: EventTranslationDto[];

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUUID()
  @IsOptional()
  venueId?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  cityId?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}

export class ListEventsQueryDto {
  @IsString()
  @IsOptional()
  organizationSlug?: string;

  @IsIn(['en', 'ar'])
  @IsOptional()
  lang?: string = 'en';

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

export class CreateEventAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @IsEnum(OrganizationRole)
  @IsIn([
    OrganizationRole.SELLER,
    OrganizationRole.SCANNER,
    OrganizationRole.EVENT_MANAGER,
  ])
  @IsNotEmpty()
  role: OrganizationRole;
}

export class GetEventQueryDto {
  @IsString()
  @IsOptional()
  organizationSlug?: string;

  @IsIn(['en', 'ar'])
  @IsOptional()
  lang?: string = 'en';
}
