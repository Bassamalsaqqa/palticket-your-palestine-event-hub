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

**Important:** Do not import `mockEvents` directly into UI components. Use the services.

## Technologies

- **Frontend:** React, TypeScript, Tailwind CSS, TanStack Query.
- **Backend:** NestJS, Prisma, PostgreSQL, Passport (Auth).

## Code Quality

The project adheres to strict **ESLint** rules. Code is structured to separate components from hooks and constants to ensure Fast Refresh works reliably.

## Known Issues & Troubleshooting

*   **Data Persistence:** Frontend data vanishes on reload (until connected to Backend).
*   **Backend Connection:** The frontend is NOT yet connected to the backend API. The Backend is standalone ready.

## Roadmap
- [x] Step A: Foundation (env validation, CORS, Prisma, Health)
- [x] Step 1: Schema + Migrations (Multi-tenant, Orders, Tickets)
- [x] Step 2: Auth + RBAC (JWT, RolesGuard, OrganizationMember)
- [x] Step 3: Domain Modules (Events/Venues/Gates/TicketTypes CRUD; Orders Create + Read; Tickets Read-only)
- [x] Step 4: Scanner endpoint + ScanLog
- [ ] Step 5: Payments, commissions, payouts, notifications
