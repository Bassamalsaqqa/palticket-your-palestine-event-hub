import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { subMonths } from 'date-fns';

@Injectable()
export class ScansCleanupService {
  private readonly logger = new Logger(ScansCleanupService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting ScanLog cleanup job...');

    // Define retention period: 6 months
    const thresholdDate = subMonths(new Date(), 6);

    try {
      const deleteResult = await this.prisma.scanLog.deleteMany({
        where: {
          scannedAt: {
            lt: thresholdDate,
          },
        },
      });

      this.logger.log(
        `Cleanup complete. Deleted ${deleteResult.count} logs older than ${thresholdDate.toISOString()}.`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to cleanup ScanLogs',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
