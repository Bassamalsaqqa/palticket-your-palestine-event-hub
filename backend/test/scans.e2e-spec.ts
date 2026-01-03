import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../src/config/env';
import { PrismaModule } from '../src/prisma/prisma.module';
import { ScansModule } from '../src/scans/scans.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/auth/roles.guard';
import { OrganizationRole, TicketStatus, ScanResult } from '@prisma/client';
import request from 'supertest';
import { Server } from 'http';
import { randomUUID } from 'crypto';

describe('ScansController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;

  const orgId = randomUUID();
  const userId = randomUUID();
  const memberId = randomUUID();
  const eventId = randomUUID();
  const ticketTypeId = randomUUID();
  const gateId = randomUUID();
  const orgSlug = `scan-org-${Date.now()}`;

  const ticketCodeValid = `TICKET-VALID-${Date.now()}`;
  const ticketCodeVoid = `TICKET-VOID-${Date.now()}`;
  let ticketValidId: string;
  let ticketVoidId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
        }),
        PrismaModule,
        ScansModule,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx
            .switchToHttp()
            .getRequest<{ user?: { id: string } }>();
          req.user = { id: userId };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest<{
            orgId?: string;
            headers: Record<string, string | string[]>;
          }>();
          const orgHeader = req.headers['x-organization-id'];
          if (!orgHeader || Array.isArray(orgHeader)) return false;
          req.orgId = orgHeader;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
    prisma = moduleFixture.get(PrismaService);

    // Setup Data
    await prisma.organization.create({
      data: {
        id: orgId,
        name: 'Scan Test Org',
        slug: orgSlug,
      },
    });

    await prisma.user.create({
      data: {
        id: userId,
        email: `scanner-${Date.now()}@example.com`,
        passwordHash: 'hash',
      },
    });

    await prisma.organizationMember.create({
      data: {
        id: memberId,
        organizationId: orgId,
        userId,
        role: OrganizationRole.STAFF,
      },
    });

    await prisma.event.create({
      data: {
        id: eventId,
        organizationId: orgId,
        startTime: new Date(),
        slug: `scan-event-${Date.now()}`,
      },
    });

    await prisma.gate.create({
      data: {
        id: gateId,
        organizationId: orgId,
        eventId,
        name: 'Main Gate',
      },
    });

    await prisma.ticketType.create({
      data: {
        id: ticketTypeId,
        eventId,
        name: 'General',
        sellPriceCents: 1000,
        partnerPriceCents: 800,
        currency: 'ILS',
        quantity: 100,
      },
    });

    // Create Order and Tickets
    const orderId = randomUUID();
    await prisma.order.create({
      data: {
        id: orderId,
        organizationId: orgId,
        eventId,
        userId,
        totalCents: 0,
        currency: 'ILS',
      },
    });

    const t1 = await prisma.ticket.create({
      data: {
        organizationId: orgId,
        eventId,
        orderId,
        ticketTypeId,
        code: ticketCodeValid,
        status: TicketStatus.ISSUED,
      },
    });
    ticketValidId = t1.id;

    const t2 = await prisma.ticket.create({
      data: {
        organizationId: orgId,
        eventId,
        orderId,
        ticketTypeId,
        code: ticketCodeVoid,
        status: TicketStatus.VOID,
      },
    });
    ticketVoidId = t2.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.scanLog.deleteMany({ where: { organizationId: orgId } });
    await prisma.ticket.deleteMany({ where: { organizationId: orgId } });
    await prisma.orderItem.deleteMany({
      where: { order: { organizationId: orgId } },
    });
    await prisma.order.deleteMany({ where: { organizationId: orgId } });
    await prisma.ticketType.deleteMany({
      where: { event: { organizationId: orgId } },
    });
    await prisma.gate.deleteMany({ where: { organizationId: orgId } });
    await prisma.event.deleteMany({ where: { organizationId: orgId } });
    await prisma.organizationMember.deleteMany({
      where: { organizationId: orgId },
    });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await app.close();
  });

  it('should GRANT access for valid ticket', async () => {
    const response = await request(httpServer)
      .post('/scan')
      .set('x-organization-id', orgId)
      .send({
        ticketCode: ticketCodeValid,
        gateId,
        eventId,
      })
      .expect(201);

    expect(response.body.result).toBe(ScanResult.GRANTED);

    // Verify DB
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketValidId },
    });
    expect(ticket?.status).toBe(TicketStatus.SCANNED);
    expect(ticket?.scannedAt).not.toBeNull();

    const log = await prisma.scanLog.findFirst({
      where: { ticketId: ticketValidId, result: ScanResult.GRANTED },
    });
    expect(log).toBeDefined();
  });

  it('should DENY access for already scanned ticket (ALREADY_USED)', async () => {
    const response = await request(httpServer)
      .post('/scan')
      .set('x-organization-id', orgId)
      .send({
        ticketCode: ticketCodeValid,
        gateId,
        eventId,
      })
      .expect(201);

    expect(response.body.result).toBe(ScanResult.DENIED_ALREADY_USED);

    // Verify Log
    const logs = await prisma.scanLog.findMany({
      where: { ticketId: ticketValidId },
    });
    expect(logs).toHaveLength(2); // 1 GRANTED, 1 DENIED_ALREADY_USED
  });

  it('should DENY access for VOID ticket', async () => {
    const response = await request(httpServer)
      .post('/scan')
      .set('x-organization-id', orgId)
      .send({
        ticketCode: ticketCodeVoid,
        gateId,
        eventId,
      })
      .expect(201);

    expect(response.body.result).toBe(ScanResult.DENIED_INVALID_TICKET); // Service maps VOID -> INVALID_TICKET
    expect(response.body.message).toMatch(/void/i);

    // Verify Log
    const log = await prisma.scanLog.findFirst({
      where: {
        ticketId: ticketVoidId,
        result: ScanResult.DENIED_INVALID_TICKET,
      },
    });
    expect(log).toBeDefined();
  });

  it('should return DENIED_INVALID_TICKET and NO LOG for non-existent code', async () => {
    const invalidCode = 'NON-EXISTENT-CODE';

    // Count before
    const countBefore = await prisma.scanLog.count({
      where: { organizationId: orgId },
    });

    const response = await request(httpServer)
      .post('/scan')
      .set('x-organization-id', orgId)
      .send({
        ticketCode: invalidCode,
        gateId,
        eventId,
      })
      .expect(201);

    expect(response.body.result).toBe(ScanResult.DENIED_INVALID_TICKET);

    // Count after
    const countAfter = await prisma.scanLog.count({
      where: { organizationId: orgId },
    });
    expect(countAfter).toBe(countBefore);
  });

  it('should DENY access if ticket belongs to different event (INVALID_EVENT)', async () => {
    const wrongEventId = randomUUID();
    const response = await request(httpServer)
      .post('/scan')
      .set('x-organization-id', orgId)
      .send({
        ticketCode: ticketCodeValid,
        gateId,
        eventId: wrongEventId,
      })
      .expect(201);

    expect(response.body.result).toBe(ScanResult.DENIED_INVALID_EVENT);
    expect(response.body.message).toMatch(/belongs to another event/i);

    // Verify Log
    const log = await prisma.scanLog.findFirst({
      where: {
        ticketId: ticketValidId,
        result: ScanResult.DENIED_INVALID_EVENT,
      },
    });
    expect(log).toBeDefined();
  });
});
