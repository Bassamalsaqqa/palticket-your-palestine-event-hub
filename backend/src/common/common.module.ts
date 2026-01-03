import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [StorageService, IdempotencyInterceptor],
  exports: [StorageService, IdempotencyInterceptor],
})
export class CommonModule {}
