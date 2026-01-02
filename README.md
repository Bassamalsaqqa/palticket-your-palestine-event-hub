# PalTicket

## Overview
PalTicket is a bilingual event ticketing platform for Palestine.

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

## Development Architecture

*   **Frontend**: React + Vite + Shadcn/UI. Uses a **Service Layer** to mock data.
*   **Backend**: NestJS + Prisma + PostgreSQL.
    *   **Multi-tenant**: Organization-based data isolation.
    *   **Domain Modules**: Events/Venues/Gates/TicketTypes (CRUD); Orders (Create + Read); Tickets (Read-only).
    *   **Scanning**: `POST /scan` with atomic scan-once enforcement and ScanLog auditing.
*   **Admin UI**: Admin forms manage Events (with translations and image uploads), Ticket Types, Gates, and Users/Roles via backend APIs.
*   **Scanner**: Integrated camera scanning with `@zxing/library`, session CSV exports, manual entry, and event-aware validation.

**Important**: Do not import `mockEvents` directly into UI components. Use the services.

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

## Roadmap
- [x] Step A: Foundation (env validation, CORS, Prisma, Health)
- [x] Step 1: Schema + Migrations (Multi-tenant, Orders, Tickets)
- [x] Step 2: Auth + RBAC (JWT, RolesGuard, OrganizationMember)
- [x] Step 3: Domain Modules (Events/Venues/Gates/TicketTypes CRUD; Orders Create + Read; Tickets Read-only)
- [x] Step 4: Scanner endpoint + ScanLog
- [ ] Step 5: Payments, commissions, payouts, notifications (deferred)

## Project State Review (Jan 1, 2026)

### Overall Progress
PalTicket has evolved into a multi-tenant, localized ticketing platform with order issuance, scan-once enforcement, admin reporting, and exports. The frontend now consumes real APIs with a mock fallback.

### Data Model & Database
- **Multi-tenant:** Organization-scoped data with OrganizationMember RBAC (ADMIN/STAFF).
- **Tickets & Scanning:** Ticket status (ISSUED/SCANNED/VOID) and ScanLog with ScanResult (GRANTED/DENIED_*).
- **Orders & Payments:** Orders include paymentProvider/paymentReference/paymentStatus placeholders (no provider integration yet).
- **Localization & Taxonomy:** Category/City + translation tables; Event/Venue translations with per-tenant slugs.

### Backend Services
- **Scanning:** Atomic scan-once logic, tenant-scoped, logs ScanResult. `POST /scan` and `GET /scan/logs`.
- **Orders:** Order creation issues tickets and returns ticket codes. Payment remains PENDING until provider integration.
- **Events/Venues/Categories/Cities:** Localized read; Events support translation arrays on create/update.
- **Admin & Members:** `/admin/stats` for KPI metrics, `/members` for org members, invite flow via `/members/invites` and `/members/invites/accept`.
- **Exports:** `GET /exports/orders.csv` and `GET /exports/tickets.csv` with optional `eventId` filter.

### Frontend Integration
- **Admin UI:** Create flows for Events/Ticket Types/Gates are wired to backend.
- **Scanner:** Uses `/scan`, returns ScanResult, camera lifecycle handled; requires HTTPS on mobile.
- **Admin Dashboard:** Uses `/admin/stats` and API-backed orders/events.
- **Admin Tools:** Audit logs, exports, order details, and edit flows are wired to the backend.
- **Invites:** Admin Users can create invites and share `/accept-invite?token=...`; the accept flow warns when API config is missing or Mock Mode is enabled.

### Known Gaps
- **Payments/Notifications**: Payment provider, commissions, payouts, and delivery channels are not implemented (deferred).

### Next Steps
- Provide frontend API config (base URL, token, org ID) for live data.
- Payments/commissions/payouts/notifications are deferred.

## API Configuration Precedence
The application resolves its data source in the following order:
1. **Force Mock Flag**: If "Force Mock Mode" is enabled in Admin Settings, all other configs are ignored.
2. **Local Storage Overrides**: Values manually set in the Admin Settings UI.
3. **Environment Variables**: `VITE_API_BASE_URL`, etc., defined in your `.env` file.
4. **Fallback**: Default mock data.

## Mock Mode
You can force the frontend to use mock data even if API environment variables or local storage overrides are present. Go to **Admin > Settings** and enable "Force Mock Mode". When enabled, this flag takes absolute precedence and will keep the application in mock mode until it is manually disabled.
