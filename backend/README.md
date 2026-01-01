<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Backend Overview

- Runtime: NestJS on http://localhost:3001
- Database: Postgres via Prisma
- Multi-tenant boundary: Organization
- RBAC: OrganizationMember (ADMIN/STAFF per org)
- DTO validation: Global ValidationPipe enabled
- Pagination: list endpoints validate skip/take and cap results at 100

## Domain Modules & Scoping

Each domain module enforces multi-tenancy and RBAC:

*   **Events/Venues/Gates/TicketTypes:**
    *   **CRUD:** Full Create/Read/Update/Delete.
    *   **Access:** ADMIN can write; STAFF can read.
    *   **Scope:** All queries filtered by `x-organization-id`.

*   **Orders/Tickets:**
    *   **Read-Only:** List and Get details only.
    *   **Access:** ADMIN and STAFF can read.
    *   **Privacy:** Explicit selection of fields (no full PII exposure).

## Environment Variables

Copy `.env.example` to `.env` and update as needed.

- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- PORT
- NODE_ENV
- CORS_ORIGINS

## Prisma Commands

```bash
$ npx prisma generate
$ npx prisma migrate dev -n init
$ npx prisma studio
```

## Project setup

```bash
$ npm install
```

## Prisma client generation

Generate the client whenever the schema changes:

```bash
$ npx prisma generate
```

## Tenant Routing Rules

- All tenant-scoped routes require `Authorization: Bearer <token>`
- All tenant-scoped routes require `x-organization-id` header
- Roles enforced by `RolesGuard`

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
