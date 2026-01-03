import { Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { ScansCleanupService } from './scans-cleanup.service';

@Module({
  controllers: [ScansController],
  providers: [ScansService, ScansCleanupService],
  exports: [ScansService],
})
export class ScansModule {}
