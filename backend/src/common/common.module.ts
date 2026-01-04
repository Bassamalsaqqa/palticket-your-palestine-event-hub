import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor';
import { ScopeGuard } from '../auth/scope.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [StorageService, IdempotencyInterceptor, ScopeGuard],
  exports: [StorageService, IdempotencyInterceptor, ScopeGuard],
})
export class CommonModule {}
