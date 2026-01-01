import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
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
