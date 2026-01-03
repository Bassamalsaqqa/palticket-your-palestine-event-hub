import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  ticketTypeId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePosOrderDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  providerReference?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
