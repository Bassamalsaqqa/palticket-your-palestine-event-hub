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
- `VITE_ORGANIZATION_ID` (tenant org UUID)

If these are not provided, the frontend continues to use mock data.

### Backend Installation
The backend is located in `/backend`.

```sh
cd backend
npm install
# Set up .env (see .env.example)
# Ensure Docker is running
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

## Authentication & Roles

### Frontend (Mock)
The frontend uses a mock authentication system for UI testing.
*   **Admin:** `admin@palticket.com` (Full access)
*   **Staff:** `staff@event.com` (Scanner access)
*   **User:** `user@example.com` (Public access)

### Backend (Real)
The backend implements **JWT Authentication** and **RBAC**.
*   **Endpoints:** `/auth/login`, `/auth/me`
*   **Guards:** Global `JwtAuthGuard` and `RolesGuard` enforce security.
*   **Multi-tenancy:** Data is scoped by `x-organization-id` header.
*   **Validation:** Global `ValidationPipe` enforces DTO validation.
*   **Pagination:** List endpoints validate `skip`/`take` (min 0) and cap results at 100.

## Development Architecture

*   **Frontend:** React + Vite + Shadcn/UI. Uses a **Service Layer** to mock data.
*   **Backend:** NestJS + Prisma + PostgreSQL.
    *   **Multi-tenant:** Organization-based data isolation.
    *   **Domain Modules:** Events/Venues/Gates/TicketTypes (CRUD); Orders (Create + Read); Tickets (Read-only).
    *   **Scanning:** `POST /scan` with atomic scan-once enforcement and ScanLog auditing.
*   **Admin UI:** Admin forms now create Events (with translations), Ticket Types, and Gates via backend APIs.

**Important:** Do not import `mockEvents` directly into UI components. Use the services.

## Technologies

- **Frontend:** React, TypeScript, Tailwind CSS, TanStack Query.
- **Backend:** NestJS, Prisma, PostgreSQL, Passport (Auth).

## Code Quality

The project adheres to strict **ESLint** rules. The root lint configuration covers both the frontend and the backend. Code is structured to separate components from hooks and constants to ensure Fast Refresh works reliably.

## Known Issues & Troubleshooting

*   **Data Persistence:** Frontend data vanishes on reload (until connected to Backend).
*   **Backend Connection:** The frontend supports connecting to the backend API for Events, Orders, and Tickets when environment variables are provided. Otherwise, it falls back to mock data.
*   **Scanner Camera (Mobile):** Camera access requires a secure context. Use `localhost` on desktop or HTTPS for mobile testing.
*   **Exports:** Admin exports support optional `eventId` filtering when a specific event is selected.

## Roadmap
- [x] Step A: Foundation (env validation, CORS, Prisma, Health)
- [x] Step 1: Schema + Migrations (Multi-tenant, Orders, Tickets)
- [x] Step 2: Auth + RBAC (JWT, RolesGuard, OrganizationMember)
- [x] Step 3: Domain Modules (Events/Venues/Gates/TicketTypes CRUD; Orders Create + Read; Tickets Read-only)
- [x] Step 4: Scanner endpoint + ScanLog
- [ ] Step 5: Payments, commissions, payouts, notifications

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
- **Admin & Members:** `/admin/stats` for KPI metrics, `/members` for org members.
- **Exports:** `GET /exports/orders.csv` and `GET /exports/tickets.csv` with optional `eventId` filter.

### Frontend Integration
- **Admin UI:** Create flows for Events/Ticket Types/Gates are wired to backend.
- **Scanner:** Uses `/scan`, returns ScanResult, camera lifecycle handled; requires HTTPS on mobile.
- **Admin Dashboard:** Uses `/admin/stats` and API-backed orders/events.

### Known Gaps
- **Tests:** Some scan tests may still assert legacy `status` instead of `result`.
- **Localization fallback:** Limited handling when a requested locale is missing.
- **Payments/Notifications:** Payment provider, commissions, payouts, and delivery channels are not implemented.
- **Admin panels:** Users/Roles/Staff/Exports/AuditLogs are read-only; edits/invites not implemented.

### Next Steps
- Update scan tests to assert `result: ScanResult`.
- Add translation fallback to English when missing.
- Implement payment provider integration and notifications.
