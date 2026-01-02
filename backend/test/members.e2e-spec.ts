import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../src/config/env';
import { PrismaModule } from '../src/prisma/prisma.module';
import { MembersModule } from '../src/members/members.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/auth/roles.guard';
import { OrganizationRole } from '@prisma/client';
import request from 'supertest';
import { Server } from 'http';
import { randomUUID } from 'crypto';

describe('MembersController (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;

  const orgId = randomUUID();
  const adminUserId = randomUUID();
  const targetUserId = randomUUID();
  const targetUserEmail = `target-${Date.now()}@example.com`;
  const nonExistentEmail = `nobody-${Date.now()}@example.com`;
  
  // To track created member ID for removal
  let createdMemberId: string | null = null;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
        }),
        PrismaModule,
        MembersModule,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx
            .switchToHttp()
            .getRequest<{ user?: { id: string } }>();
          req.user = { id: adminUserId };
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

    // Setup DB
    await prisma.organization.create({
      data: {
        id: orgId,
        name: 'Members Test Org',
        slug: `members-test-${Date.now()}`,
      },
    });

    await prisma.user.create({
      data: {
        id: adminUserId,
        email: `admin-${Date.now()}@example.com`,
        passwordHash: 'hash',
        name: 'Admin User',
      },
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: adminUserId,
        role: OrganizationRole.ADMIN,
      },
    });

    await prisma.user.create({
      data: {
        id: targetUserId,
        email: targetUserEmail,
        passwordHash: 'hash',
        name: 'Target User',
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.organizationMember.deleteMany({ where: { organizationId: orgId } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, targetUserId] } } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
    await app.close();
  });

  it('/members/invite (POST) invites a user', async () => {
    const response = await request(httpServer)
      .post('/members/invite')
      .set('x-organization-id', orgId)
      .send({
        email: targetUserEmail,
        role: 'STAFF',
      })
      .expect(201);

    expect(response.body.userId).toBe(targetUserId);
    expect(response.body.role).toBe('STAFF');
    expect(response.body.organizationId).toBe(orgId);
    createdMemberId = response.body.id;
  });

  it('/members/invite (POST) fails if user already member', async () => {
    await request(httpServer)
      .post('/members/invite')
      .set('x-organization-id', orgId)
      .send({
        email: targetUserEmail,
        role: 'STAFF',
      })
      .expect(409);
  });

  it('/members/invite (POST) fails if user not found', async () => {
    await request(httpServer)
      .post('/members/invite')
      .set('x-organization-id', orgId)
      .send({
        email: nonExistentEmail,
        role: 'STAFF',
      })
      .expect(404);
  });

  it('/members/:id (DELETE) removes a member', async () => {
    expect(createdMemberId).toBeDefined();
    
    await request(httpServer)
      .delete(`/members/${createdMemberId}`)
      .set('x-organization-id', orgId)
      .expect(200);

    // Verify removal
    const member = await prisma.organizationMember.findUnique({
      where: { id: createdMemberId! },
    });
    expect(member).toBeNull();
  });
});
