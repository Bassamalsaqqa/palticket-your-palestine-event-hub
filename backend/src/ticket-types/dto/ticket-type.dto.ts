import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  Length,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketTypeDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  sellPriceCents: number;

  @IsInt()
  @Min(0)
  partnerPriceCents: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsInt()
  @Min(0)
  quantity: number;
}

export class UpdateTicketTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sellPriceCents?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  partnerPriceCents?: number;

  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;
}

export class ListTicketTypesQueryDto {
  @IsUUID()
  @IsOptional()
  eventId?: string;

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
