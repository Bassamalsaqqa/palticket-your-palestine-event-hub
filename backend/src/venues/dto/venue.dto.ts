import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsIn,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VenueTranslationDto {
  @IsIn(['en', 'ar'])
  locale: 'en' | 'ar';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

export class CreateVenueDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VenueTranslationDto)
  translations: VenueTranslationDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;
}

export class UpdateVenueDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VenueTranslationDto)
  translations?: VenueTranslationDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;
}

export class ListVenuesQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(['en', 'ar'])
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

export class GetVenueQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(['en', 'ar'])
  lang?: string = 'en';
}
