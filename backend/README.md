<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Backend Overview

- Runtime: NestJS on http://localhost:3001
- Database: Postgres via Prisma
- Multi-tenant boundary: Organization
- RBAC: OrganizationRole (ORG_ADMIN, EVENT_MANAGER, SELLER, SCANNER, FINANCE)
  - ADMIN -> ORG_ADMIN
  - STAFF -> SELLER (compatibility: retains staff access until ScopeGuard)
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
    *   **Price Versions:** `POST /ticket-types/:id/price-versions`, `GET /ticket-types/:id/price-versions` (Admin/EventManager).
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
    *   **Orders Export:** Returns an item-level CSV (one row per order item) including `unitPriceCents`, `currency`, and `priceVersionId` snapshots.
    *   **Access**: ADMIN only

## Ops Endpoints Plan (Phase 0/1)
- `/ops/orders` (POS create, Idempotency-Key required, SELLER assignment required).
- `/ops/scans` (SCANNER assignment required).
- `/ops/exports/sold-tickets` (FINANCE/ORG_ADMIN, audit logged).
- `/ops/orders/:id/confirm-payment` (FINANCE/ORG_ADMIN only, audited).
- `/events/:id/assignments` (ORG_ADMIN only).
- `/gates/:id/assignments` (ORG_ADMIN only).

## Project State (Jan 2026)
- **Implemented hardening:** inventory enforcement (POS + non-POS), idempotency, throttling, ScanLog retention + composite index, CSV injection protection.
- **RBAC & Assignments (Phase 1):** Scoped scanning and POS sales via `EventStaffAssignment` and `GateAssignment`. Mandatory `eventId` for scanning. Admin UI for assignments.
- **Auditability:** export audit logs + audit log model.
- **Pricing (Phase 2):** price versioning with OrderItem snapshots and item-level order exports.

## Pricing Governance (Phase 2)
PalTicket implements price immutability via versioning and snapshotting:
- **Price Versions:** `TicketTypePriceVersion` allows scheduling price changes for a specific `TicketType` and `currency`.
- **Selection Logic:** The system automatically selects the most recent active price version (matching currency, `startsAt <= now`, and `endsAt` is null or `> now`).
- **Snapshots:** When an order is created, `unitPriceCents`, `currency`, and the applied `priceVersionId` are snapshotted into each `OrderItem`. This ensures that subsequent price changes do not affect existing orders and provides a historical audit trail.
- **Consistency:** Both public orders (`POST /orders`) and POS orders (`POST /ops/orders`) follow the same pricing selection and snapshotting rules.

### Migration Note (Dev Only)
If you already have data and the initial `20260104184304_add_price_versioning` migration fails due to NOT NULL columns:
1. Manually add nullable columns and backfill:
   - `ALTER TABLE "OrderItem" ADD COLUMN "unitPriceCents" INTEGER;`
   - `ALTER TABLE "OrderItem" ADD COLUMN "currency" TEXT;`
   - `UPDATE "OrderItem" SET "unitPriceCents" = "priceCents" WHERE "unitPriceCents" IS NULL;`
   - `UPDATE "OrderItem" SET "currency" = "TicketType"."currency" FROM "TicketType" WHERE "OrderItem"."ticketTypeId" = "TicketType"."id" AND "OrderItem"."currency" IS NULL;`
2. Mark the migration as applied:
   - `npx prisma migrate resolve --applied 20260104184304_add_price_versioning`
3. Apply the repair migration:
   - `npx prisma migrate deploy`

## Next Phase Targets
- Central EventPolicyService for event status/visibility enforcement (Phase 3).
- Pricing policy enforcement + approvals.

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
   - `POST /scan` with `ticketCode`, `eventId`, and (optional) `gateId`.

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
