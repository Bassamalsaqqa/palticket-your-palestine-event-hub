import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.user.findFirst();
    } catch {
      dbStatus = 'error';
    }

    return {
      status: 'ok',
      service: 'palticket-backend',
      time: new Date().toISOString(),
      db: dbStatus,
    };
  }
}
