# PalTicket

## Overview
PalTicket is a bilingual (English/Arabic) event ticketing + scanning + POS platform for Palestine. The project is built with production intent and enforces strict tenant isolation and auditability.

## Production Intent (Shipping Gate)
You do not ship "production" until all are true:
- No oversell under concurrency (DB row locks in a transaction; not updateMany-only).
- Scoped scanning (event/gate assignments enforced).
- Price immutability via versioning + order item snapshots.
- POS idempotency (duplicate issuance prevention).
- Audit + export logging (forensics, disputes, finance).

## Architecture
- Frontend: React + Vite + TypeScript, runs at http://localhost:8080
- Backend: NestJS + Prisma + PostgreSQL, runs at http://localhost:3001
- Database: Postgres on http://localhost:5432 (via Docker)

## Getting Started

### Prerequisites
*   Node.js & npm (or Bun)
*   Docker (for Database)

### Full Application (Single Command)
To run both backend and frontend simultaneously:
```sh
npm run dev:all
```

To prepare the database (generate, migrate, seed) and then run both:
```sh
npm run dev:all:seed
```

### Frontend Installation
```sh
npm install
npm run dev
```

### Frontend API (optional)
To connect the UI to the backend APIs, set the following environment variables before running the frontend:

- `VITE_API_BASE_URL` (e.g. `http://localhost:3001`)
- `VITE_API_TOKEN` (JWT access token)
- `VITE_ORGANIZATION_ID` (tenant org UUID; required for org-scoped endpoints)

Invite acceptance uses `/accept-invite?token=...` and only requires `VITE_API_BASE_URL` + `VITE_API_TOKEN` (no organization ID).
Mock content in `src/data/mockEvents.ts` is generated from `public/English.json` and `public/Arabic.json` for local-only development.
If you update the JSON source files, re-generate `src/data/mockEvents.ts` using the repo's generator workflow.
Avoid hand-editing `src/data/mockEvents.ts` directly to prevent inconsistency.
The `getLocalizedText` helper in `src/i18n/localize.ts` is the preferred path for localized UI display.

### Backend Installation
The backend is located in `/backend`.

```sh
cd backend
npm install
# Set up .env (see .env.example)
# Add storage configuration:
# STORAGE_DRIVER=local
# STORAGE_LOCAL_ROOT=uploads
# STORAGE_PUBLIC_URL=http://localhost:3001/uploads
# Ensure Docker is running
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

### Prisma Configuration
Prisma uses `backend/prisma.config.ts`. It loads environment variables via `dotenv/config` before running Prisma commands. `@prisma/config` is a backend devDependency.

## Authentication & Roles

### Frontend (Mock)
The frontend uses a mock authentication system for UI testing. Backend APIs can still be used if API env vars are provided.
*   **Admin:** `admin@palticket.com` (Full access)
*   **Staff:** `staff@palticket.com` (Scanner access)
*   **User:** `user@example.com` (Public access)

### Backend (Real)
The backend implements **JWT Authentication** and **RBAC**.
*   **Endpoints:** `/auth/login`, `/auth/me`
*   **Guards:** Global `JwtAuthGuard` and `RolesGuard` enforce security.
*   **Multi-tenancy:** Data is scoped by `x-organization-id` header.
*   **Validation:** Global `ValidationPipe` enforces DTO validation.
*   **Pagination:** List endpoints validate `skip`/`take` (min 0) and cap results at 100.

### Operating Model (Target)
- **Tenant boundary:** Organization. Every event belongs to exactly one organization.
- **Platform roles:** `PLATFORM_SUPERADMIN` (cross-tenant full access), `PLATFORM_SUPPORT` (cross-tenant read-only + allowlist ops).
- **Org roles:** `ORG_ADMIN`, `EVENT_MANAGER`, `SELLER`, `SCANNER`, `FINANCE`.
- **Scope enforcement:** Role + organization scope (mandatory) + `EventStaffAssignment` and optional `GateAssignment`.
- **Defaults:** SELLER restricted to assigned events; ORG_ADMIN can view everything but scanning still requires assignment.

## Core Workflows
A) Organization bootstrap (Platform -> Partner autonomy)
- PLATFORM_SUPERADMIN creates Organization.
- ORG_ADMIN invited/created for that org.
- ORG_ADMIN invites staff and assigns roles and event/gate scopes.

B) Event creation (ORG_ADMIN / EVENT_MANAGER)
- Create event (status DRAFT) with bilingual translations.
- Set sale windows + event windows + currency rules.
- Attach Venue, create Gates, create Ticket Types.
- Create inventory (capacity) for each TicketType.
- Create price versions (per currency) and publish.
- Publish event (DRAFT -> PUBLISHED -> LIVE).

C) POS selling (SELLER)
- Select eventId, items[], currency, paymentMethod (CASH|CARD).
- Enforce inventory lock + decrement.
- Select price version, snapshot into OrderItem.
- Require Idempotency-Key.
- CASH: Payment SUCCEEDED, Order PAID, tickets ISSUED.
- CARD Phase 1: require providerReference; default to Order PENDING_PAYMENT, Payment PENDING, tickets PENDING (not scannable) until confirm-payment.
- CARD Phase 2: PSP webhook -> Payment SUCCEEDED -> Order PAID -> tickets ISSUED.

D) Scanning (SCANNER)
- Scanner selects Gate (sticky).
- Validate assignment (event and optionally gate), ticket ownership/org/event.
- Atomic update ISSUED -> SCANNED, write ScanLog.
- PENDING tickets must be denied with explicit reason.

E) Exports (FINANCE / ORG_ADMIN)
- Include payment fields + seller identity.
- Every export is audit logged with filters.

## Data Model Targets (Backend)
- **Inventory:** TicketTypeInventory (capacity/sold/reserved).
- **Pricing:** TicketTypePriceVersion, OrderItem snapshots (unitPriceCents, currency, priceVersionId).
- **Payments:** Order status (CREATED/PENDING_PAYMENT/PAID/CANCELLED/REFUNDED) + Payment model (CASH/CARD).
- **Audit/Idempotency:** AuditLog + IdempotencyKey scoped by org/endpoint/key.
- **Assignments:** EventStaffAssignment and optional GateAssignment.

## Roadmap (Phased)
Phase 0 - Stabilize foundation (1-2 sprints)
- Inventory locking in POS order creation using row locks.
- POS Idempotency-Key support with requestHash mismatch protection.
- Payment model + POS Cash/Card (Phase 1 manual reference with confirm endpoint).
- Exports include payment fields + audit log.
- Audit log framework for critical actions (index on organizationId, createdAt).

Phase 1 - RBAC overhaul + scoped assignments (1-2 sprints)
- Expand roles enum.
- EventStaffAssignment/GateAssignment + ScopeGuard.
- Org admin endpoints to manage assignments.

Phase 2 - Price versioning + governance (1 sprint)
- TicketTypePriceVersion + snapshot in OrderItem.
- Pricing policy enforcement + approvals.

Phase 3 - Central policy enforcement (1 sprint)
- EventPolicyService (canSell/canScan/visibility).
- Enforce across orders, scans, public listing.

Phase 4 - Security hardening & ops readiness (1-2 sprints)
- Rate limiting for auth/scans/orders.
- Structured logging + correlation IDs.
- Retention jobs + dashboards.

Phase 5 - Provider card integration + buyer foundations (later)
- PSP integration + webhooks + refunds.
- Buyer-facing endpoints and reservation holds.

## Project State (Jan 2026)
- **Implemented hardening:** inventory enforcement, idempotency, throttling, ScanLog retention + composite index, CSV injection protection.
- **Prisma config:** `backend/prisma.config.ts` with `@prisma/config` devDependency.
- **Bilingual UI:** localized display helper + bilingual meta title preserved.

## Next Session Focus
- Implement Payment model + POS order creation flow with CASH/CARD (manual confirm flow).
- Add AuditLog + export audit logging (filters and actor info).
- Add EventStaffAssignment/GateAssignment + ScopeGuard (Phase 1 kickoff).
- Add tests for oversell, idempotency replay, scope leakage, pending ticket scan denial.

## Technologies
- **Frontend:** React, TypeScript, Tailwind CSS, TanStack Query.
- **Backend:** NestJS, Prisma, PostgreSQL, Passport (Auth).

## Code Quality
The project adheres to strict **ESLint** rules. The root lint configuration covers both the frontend and the backend. Code is structured to separate components from hooks and constants to ensure Fast Refresh works reliably.

## Known Issues & Troubleshooting
*   **Data Persistence**: Mock orders/tickets reset on reload. Auth persists only when "Remember me" is checked.
*   **Backend Connection**: The frontend supports connecting to backend APIs when environment variables are provided. Otherwise, it falls back to mock data.

## Admin & Staff Testing Guide

### 1. Initial Setup
- Start backend: `npm run dev:all:seed` (prepares and seeds database).
- Login at `http://localhost:8080/en/login` with:
  - **Email**: `admin@palticket.com`
  - **Password**: `123456`
- Get your **Organization ID** from the backend logs or database (seeded slug is `palticket-demo`).

### 2. Admin Flow
- **Create Event**: Go to `/admin/events`, click "Create Event". Fill in the slug, time, and localized details.
- **Add Pricing**: Go to `/admin/ticket-types`, create a new tier (e.g., "VIP") for your event.
- **Add Gates**: Go to `/admin/gates`, create a gate (e.g., "Main Entrance") for your event.

### 3. Customer Flow
- Find your event on the Home or Discover page.
- Select tickets and "Purchase" (this generates real tickets in the backend).
- View your tickets in the **Account** section.

### 4. Scanner Flow
- Use a mobile device on the same network or `localhost`.
- Access `/scan`. The camera requires **HTTPS** (or `localhost`) to function.
- Select your event and gate.
- Scan the QR code from the customer's account.

## API Configuration Precedence
The application resolves its data source in the following order:
1. **Force Mock Flag**: If "Force Mock Mode" is enabled in Admin Settings, all other configs are ignored.
2. **Local Storage Overrides**: Values manually set in the Admin Settings UI.
3. **Environment Variables**: `VITE_API_BASE_URL`, etc., defined in your `.env` file.
4. **Fallback**: Default mock data.

## Mock Mode
You can force the frontend to use mock data even if API environment variables or local storage overrides are present. Go to **Admin > Settings** and enable "Force Mock Mode". When enabled, this flag takes absolute precedence and will keep the application in mock mode until it is manually disabled.
