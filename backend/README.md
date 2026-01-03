<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Backend Overview

- Runtime: NestJS on http://localhost:3001
- Database: Postgres via Prisma
- Multi-tenant boundary: Organization
- RBAC: OrganizationMember (ADMIN/STAFF today; Phase 1 expands roles)
- DTO validation: Global ValidationPipe enabled

## Production Intent (Shipping Gate)
- No oversell under concurrency (DB row locks in a transaction; updateMany-only is insufficient).
- Scoped scanning (event/gate assignments enforced).
- Price immutability via versioning + order item snapshots.
- POS idempotency (duplicate issuance prevention).
- Audit + export logging (forensics, disputes, finance).

## Operating Model (Target)
- Platform roles: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT.
- Org roles: ORG_ADMIN, EVENT_MANAGER, SELLER, SCANNER, FINANCE.
- Scope enforcement: Role + org scope + EventStaffAssignment + optional GateAssignment.
- Defaults: SELLER restricted to assigned events; ORG_ADMIN can view everything but scanning still requires assignment.

## Domain Modules & Scoping

Each domain module enforces multi-tenancy and RBAC:

*   **Events/Venues/Gates/TicketTypes:**
    *   **CRUD:** Full Create/Read/Update/Delete.
    *   **Endpoints:** `GET /events/slug/:slug?lang=en|ar`
    *   **Access:** ADMIN can write; STAFF can read.
    *   **Scope:** All queries filtered by `x-organization-id`.
    *   **Localization:** Events and Venues support multi-locale translations (e.g., "en", "ar") via separate translation tables. Use `?lang=en|ar` (default: `en`) on read endpoints to retrieve localized content, with English fallback when missing.
    *   **Create/Update:** Events accept `translations[]` and optional `venueId`, `categoryId`, and `cityId`.

*   **Taxonomy (Categories & Cities):**
    *   **Endpoints:** `GET /categories?lang=en|ar`, `GET /cities?lang=en|ar`
    *   **Global & Tenant-specific:** Taxonomy entries can be global (system-wide) or tenant-specific.
    *   **Localization:** Fully localized names via translation tables. Use `?lang=en|ar` on applicable endpoints, with English fallback when missing.

*   **Orders/Tickets:**
    *   **Orders:** Create + read (ticket issuance happens here). Non-POS orders create PENDING tickets until payment.
    *   **Tickets:** Read-only (list and detail).
    *   **Access:** ADMIN and STAFF can read.
    *   **Privacy:** Explicit selection of fields (no full PII exposure).

*   **Scanning:**
    *   **Endpoint:** `POST /scan`.
    *   **Atomicity:** Uses Prisma transactions to ensure one-time entry.
    *   **Isolation:** Strict `x-organization-id` scoping. Cross-org scans return "Not Found".
    *   **Responses:** Uses `ScanResult` enum (GRANTED / DENIED_*).
    *   **Logging:** Success/Duplicate/Void are logged in `ScanLog`. Invalid codes are not logged (ticketId FK required).

*   **Invites (Member Onboarding):**
    *   **Endpoints:** `POST /members/invites` (Create), `POST /members/invites/accept` (Accept).
    *   **Flow:** Admin creates invite -> Token generated -> User accepts via link.
    *   **Access:** Create requires ADMIN; Accept requires valid JWT (no org context needed initially).
    *   **Safety:** Atomic acceptance, expiration checks, and org-scoped creation.

*   **Exports:**
    *   **Endpoints:** `GET /exports/orders.csv`, `GET /exports/tickets.csv`
    *   **Filters:** Optional `eventId` query parameter to export a single event.
    *   **Access**: ADMIN only

## Ops Endpoints Plan (Phase 0/1)
- `/ops/orders` (POS create, Idempotency-Key required, SELLER assignment).
- `/ops/scans` (SCANNER assignment required).
- `/ops/exports/sold-tickets` (FINANCE/ORG_ADMIN, audit logged).
- `/ops/orders/:id/confirm-payment` (FINANCE/ORG_ADMIN only, audited).

## Recent Hardening (Phase 0 complete)
- **Inventory:** Orders enforce ticket type capacity with row locks (POS + non-POS).
- **Idempotency:** `POST /orders` supports `Idempotency-Key` scoped by org/user/method/path.
- **Rate Limiting:** Global throttling (100/min); orders (5/min); scans (60/min).
- **Log Retention:** Daily cleanup of scan logs older than 6 months.
- **ScanLog Indexing:** Composite index on `organizationId, scannedAt`.
- **Payments:** Manual card confirm flow with PENDING tickets until confirm.
- **Exports:** Orders export includes payment + seller fields; audit logged.

## Next Phase Targets
- Roles enum expansion and assignments.
- ScopeGuard enforcement for scans/orders/exports.
- EventStaffAssignment/GateAssignment admin flows.
- Price versioning + OrderItem snapshots.

## Admin/Staff Testing (E2E)

1. **Get Authenticated**:
   - `POST /auth/login` with `{"email":"admin@palticket.com", "password":"password"}`.
   - Use the `access_token` in the `Authorization: Bearer <token>` header.
2. **Organization ID**:
   - Include `x-organization-id` in all tenant routes. The default seeded ID can be found via `GET /organizations` after login.
3. **Full Cycle**:
   - `POST /events` -> `POST /ticket-types` -> `POST /gates`.
   - `POST /orders` (non-POS creates PENDING tickets).
   - `POST /ops/orders` (POS creates PAID tickets for CASH).
   - `POST /ops/orders/:id/confirm-payment` for manual card flow.
   - `POST /scan` with `ticketCode` from a PAID/ISSUED ticket and `gateId`.

## Environment Variables

Copy `.env.example` to `.env` and update as needed.

- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- PORT
- NODE_ENV
- CORS_ORIGINS

## Storage Configuration

The backend supports local and S3 storage (stubbed).

- `STORAGE_DRIVER`: `local` or `s3` (default: `local`)
- `STORAGE_LOCAL_ROOT`: Directory name for local storage (default: `uploads`)
- `STORAGE_PUBLIC_URL`: Public base URL for assets (default: `http://localhost:3001/uploads`)

## Image Upload Limits

Event images are limited to:
- **Size**: Maximum 5MB
- **Types**: `png`, `jpg`, `jpeg`, `webp` (MIME type validated)

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
