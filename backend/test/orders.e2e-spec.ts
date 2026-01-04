import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../src/config/env';
import { PrismaModule } from '../src/prisma/prisma.module';
import { OrdersModule } from '../src/orders/orders.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/auth/roles.guard';
import { ScopeGuard } from '../src/auth/scope.guard';
import { OrganizationRole } from '@prisma/client';
import request from 'supertest';
import type { Response } from 'supertest';
import { Server } from 'http';
import { randomUUID } from 'crypto';

type OrderCreateResponse = {
  id: string;
  totalCents: number;
  currency: string;
  paymentStatus: string;
  tickets: Array<{ id: string }>;
};

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let orderId: string | null = null;

  const orgId = randomUUID();
  const userId = randomUUID();
  const memberId = randomUUID();
  const eventId = randomUUID();
  const ticketTypeId = randomUUID();
  const orgSlug = `org-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
        }),
        PrismaModule,
        OrdersModule,
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
      .overrideGuard(ScopeGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
    prisma = moduleFixture.get(PrismaService);

    await prisma.organization.create({
      data: {
        id: orgId,
        name: 'Test Org',
        slug: orgSlug,
      },
    });

    await prisma.user.create({
      data: {
        id: userId,
        email: `orders-e2e-${Date.now()}@example.com`,
        passwordHash: 'hash',
      },
    });

    await prisma.organizationMember.create({
      data: {
        id: memberId,
        organizationId: orgId,
        userId,
        role: OrganizationRole.ORG_ADMIN,
      },
    });

    await prisma.event.create({
      data: {
        id: eventId,
        organizationId: orgId,
        startTime: new Date(),
        slug: `order-event-${Date.now()}`,
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
        quantity: 10,
      },
    });

    await prisma.ticketTypeInventory.create({
      data: {
        organizationId: orgId,
        ticketTypeId,
        capacity: 10,
      },
    });
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.ticket.deleteMany({ where: { orderId } });
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }

    await prisma.ticketTypeInventory.deleteMany({ where: { ticketTypeId } });
    await prisma.ticketType.deleteMany({ where: { id: ticketTypeId } });
    await prisma.event.deleteMany({ where: { id: eventId } });
    await prisma.organizationMember.deleteMany({ where: { id: memberId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });

    await app.close();
  });

  it('/orders (POST) creates order and tickets', async () => {
    const response = await request(httpServer)
      .post('/orders')
      .set('x-organization-id', orgId)
      .send({
        eventId,
        items: [{ ticketTypeId, quantity: 2 }],
        attendeeName: 'Test Attendee',
      })
      .expect(201);

    const body = response.body as OrderCreateResponse;
    orderId = body.id;

    expect(body.totalCents).toBe(2000);
    expect(body.currency).toBe('ILS');
    expect(body.paymentStatus).toBe('PENDING');
    expect(body.tickets).toHaveLength(2);
  });
});
