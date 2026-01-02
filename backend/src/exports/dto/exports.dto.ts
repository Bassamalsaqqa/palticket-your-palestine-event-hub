import { IsOptional, IsUUID } from 'class-validator';

export class ExportQueryDto {
  @IsOptional()
  @IsUUID()
  eventId?: string;
}
