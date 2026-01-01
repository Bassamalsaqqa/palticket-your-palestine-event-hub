import { IsOptional, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTaxonomyQueryDto {
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
