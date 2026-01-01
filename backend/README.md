<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Backend Overview

- Runtime: NestJS on http://localhost:3001
- Database: Postgres via Prisma
- Multi-tenant boundary: Organization
- RBAC: OrganizationMember (ADMIN/STAFF per org)
- DTO validation: Global ValidationPipe enabled

## Domain Modules & Scoping

Each domain module enforces multi-tenancy and RBAC:

*   **Events/Venues/Gates/TicketTypes:**
    *   **CRUD:** Full Create/Read/Update/Delete.
    *   **Endpoints:** `GET /events/slug/:slug?lang=en|ar`
    *   **Access:** ADMIN can write; STAFF can read.
    *   **Scope:** All queries filtered by `x-organization-id`.
    *   **Localization:** Events and Venues support multi-locale translations (e.g., "en", "ar") via separate translation tables. Use `?lang=en|ar` (default: `en`) on read endpoints to retrieve localized content.
    *   **Create/Update:** Events accept `translations[]` and optional `venueId`, `categoryId`, and `cityId`.

*   ** Taxonomy (Categories & Cities):**
    *   **Endpoints:** `GET /categories?lang=en|ar`, `GET /cities?lang=en|ar`
    *   **Global & Tenant-specific:** Taxonomy entries can be global (system-wide) or tenant-specific.
    *   **Localization:** Fully localized names via translation tables. Use `?lang=en|ar` on applicable endpoints.

*   **Orders/Tickets:**
    *   **Orders:** Create + read (ticket issuance happens here). Includes `attendeeName`.
    *   **Tickets:** Read-only (list and detail).
    *   **Access:** ADMIN and STAFF can read.
    *   **Privacy:** Explicit selection of fields (no full PII exposure).

*   **Scanning:**
    *   **Endpoint:** `POST /scan`.
    *   **Atomicity:** Uses Prisma transactions to ensure one-time entry.
    *   **Isolation:** Strict `x-organization-id` scoping. Cross-org scans return "Not Found".
    *   **Responses:** Uses `ScanResult` enum (GRANTED / DENIED_*).
    *   **Logging:** Success/Duplicate/Void are logged in `ScanLog`. Invalid codes are not logged (ticketId FK required).

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
$ npm run prisma:seed
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
