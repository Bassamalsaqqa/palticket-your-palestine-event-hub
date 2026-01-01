# PalTicket

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

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

## Authentication & Roles (Frontend Mock)

The frontend currently uses a mock authentication system.

| Role | Access Level | Email Pattern | Example Login |
|------|-------------|---------------|---------------|
| **Admin** | Full access to Admin Dashboard, Scanner, and User features. | Starts with `admin` | `admin@palticket.com` |
| **Staff** | Access to Scanner and User features. | Starts with `staff` | `staff@event.com` |
| **User** | Access to public events and personal account only. | Any other email | `user@example.com` |

**Seed data available for admin@palticket.com.**

**Password:** Any string with 6+ characters (e.g., `123456`).

## Development Architecture

*   **Frontend:** React + Vite + Shadcn/UI. Uses a **Service Layer** to mock data.
*   **Backend:** NestJS + Prisma + PostgreSQL.
    *   **Multi-tenant:** Organization-based data isolation.
    *   **Scanning:** Database-enforced atomic entry validation.

**Important:** Do not import `mockEvents` directly into UI components. Use the services.

## Technologies

- **Frontend:** React, TypeScript, Tailwind CSS, TanStack Query.
- **Backend:** NestJS, Prisma, PostgreSQL.

## Code Quality

The project adheres to strict **ESLint** rules. Code is structured to separate components from hooks and constants to ensure Fast Refresh works reliably.

## Known Issues & Troubleshooting

*   **Data Persistence:** Frontend data vanishes on reload (until connected to Backend).
*   **Backend Connection:** The frontend is NOT yet connected to the backend API.

## Roadmap
- Step A: Foundation (env validation, CORS allowlist, PrismaModule, /health) - done
- Step 1: Schema + migrations (multi-tenant + RBAC + orders/tickets) - in progress
- Step 2: Auth + RBAC module (OrganizationMember) - next
- Step 3: Events / Orders / Tickets modules - next
- Step 4: Scanner endpoint + ScanLog - next
- Step 5: Payments, commissions, payouts, notifications - later

## Deployment

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.
