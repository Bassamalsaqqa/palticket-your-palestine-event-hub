import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ScansController } from '../src/scans/scans.controller';
import { ScansService } from '../src/scans/scans.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/auth/roles.guard';

describe('ScansController (e2e)', () => {
  let app: INestApplication;
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
        canActivate: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { id: 'user-1' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (ctx) => {
          const req = ctx.switchToHttp().getRequest();
          const orgId = req.headers['x-organization-id'];
          if (!orgId) return false;
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
  });

  afterAll(async () => {
    await app.close();
  });

  it('/scan (POST) success', () => {
    scansService.scan.mockResolvedValue({ status: 'success' });

    return request(app.getHttpServer())
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({ ticketCode: 'VALID' })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('success');
      });
  });

  it('/scan (POST) should return 403 when x-organization-id is missing', () => {
    return request(app.getHttpServer())
      .post('/scan')
      .send({ ticketCode: 'VALID' })
      .expect(403);
  });

  it('/scan (POST) should return 403 when RolesGuard returns false', () => {
    rolesGuardCanActivate.mockReturnValue(false);

    return request(app.getHttpServer())
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

    return request(app.getHttpServer())
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({ ticketCode: 'MISSING' })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('invalid');
        expect(res.body.message).toBe('Ticket not found');
      });
  });

  it('/scan (POST) invalid input', () => {
    return request(app.getHttpServer())
      .post('/scan')
      .set('x-organization-id', 'org-1')
      .send({}) // Missing ticketCode
      .expect(400);
  });
});
