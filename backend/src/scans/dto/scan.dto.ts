import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScanResult } from '@prisma/client';

export class ScanRequestDto {
  @IsString()
  @IsNotEmpty()
  ticketCode: string;

  @IsOptional()
  @IsUUID()
  gateId?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;
}

export class ScanResponseDto {
  result: ScanResult;
  message: string;
  timestamp: Date;
  ticket?: {
    id: string;
    attendeeName?: string | null;
    ticketType?: string;
  };
}

export class ListScanLogsQueryDto {
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsUUID()
  gateId?: string;

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
