import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { PublicEventsController } from './public-events.controller';
import { EventPolicyService } from './event-policy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventsController, PublicEventsController],
  providers: [EventsService, EventPolicyService],
  exports: [EventsService, EventPolicyService],
})
export class EventsModule {}
