import { Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansController } from './scans.controller';
import { ScansCleanupService } from './scans-cleanup.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ScansController],
  providers: [ScansService, ScansCleanupService],
  exports: [ScansService],
})
export class ScansModule {}
