import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ScanRequestDto {
  @IsString()
  @IsNotEmpty()
  ticketCode: string;

  @IsOptional()
  @IsUUID()
  gateId?: string;
}

export class ScanResponseDto {
  status: 'success' | 'duplicate' | 'invalid';
  message: string;
  timestamp: Date;
  ticket?: {
    id: string;
    attendeeName?: string | null;
    ticketType?: string;
  };
}
