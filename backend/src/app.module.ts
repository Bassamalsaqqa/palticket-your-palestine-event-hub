import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { VenuesModule } from './venues/venues.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { GatesModule } from './gates/gates.module';
import { OrdersModule } from './orders/orders.module';
import { OpsModule } from './ops/ops.module';
import { TicketsModule } from './tickets/tickets.module';
import { ScansModule } from './scans/scans.module';
import { AdminModule } from './admin/admin.module';
import { MembersModule } from './members/members.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { CitiesModule } from './cities/cities.module';
import { ExportsModule } from './exports/exports.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { validate } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    EventsModule,
    OrganizationsModule,
    VenuesModule,
    TicketTypesModule,
    GatesModule,
    OrdersModule,
    OpsModule,
    TicketsModule,
    ScansModule,
    AdminModule,
    MembersModule,
    UsersModule,
    CategoriesModule,
    CitiesModule,
    ExportsModule,
    HealthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
