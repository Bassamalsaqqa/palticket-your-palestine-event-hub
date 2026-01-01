import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import type { Response } from 'supertest';
import { ScansController } from '../src/scans/scans.controller';
import { ScansService } from '../src/scans/scans.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/auth/roles.guard';
import { Server } from 'http';

describe('ScansController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  const scansService = { scan: jest.fn() };
  const rolesGuardCanActivate = jest.fn(() => true);

  beforeEach(async () => {
    rolesGuardCanActivate.mockReturnValue(true);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ScansController],
      providers: [
        {
          provide: ScansService,
          useValue: scansService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx
            .switchToHttp()
            .getRequest<{ user?: { id: string } }>();
          req.user = { id: 'user-1' };
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
          const orgId = req.headers['x-organization-id'];
          if (!orgId || Array.isArray(orgId)) return false;
          req.orgId = orgId;
          return rolesGuardCanActivate();
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/scan (POST) success', () => {
    scansService.scan.mockResolvedValue({ status: 'success' });

    return request(httpServer)
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({ ticketCode: 'VALID' })
      .expect(201)
      .expect((res: Response) => {
        const body = res.body as { status: string };
        expect(body.status).toBe('success');
      });
  });

  it('/scan (POST) should return 403 when x-organization-id is missing', () => {
    return request(httpServer)
      .post('/scan')
      .send({ ticketCode: 'VALID' })
      .expect(403);
  });

  it('/scan (POST) should return 403 when RolesGuard returns false', () => {
    rolesGuardCanActivate.mockReturnValue(false);

    return request(httpServer)
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({ ticketCode: 'VALID' })
      .expect(403);
  });

  it('/scan (POST) should return invalid status for non-existent ticket', () => {
    scansService.scan.mockResolvedValue({
      status: 'invalid',
      message: 'Ticket not found',
    });

    return request(httpServer)
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({ ticketCode: 'MISSING' })
      .expect(201)
      .expect((res: Response) => {
        const body = res.body as { status: string; message: string };
        expect(body.status).toBe('invalid');
        expect(body.message).toBe('Ticket not found');
      });
  });

  it('/scan (POST) invalid input', () => {
    return request(httpServer)
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({}) // Missing ticketCode
      .expect(400);
  });
});
