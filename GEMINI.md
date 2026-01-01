# PalTicket Context Guide

## Project Overview
**PalTicket** is a bilingual (English/Arabic) event ticketing and discovery platform tailored for the Palestinian market. It is a Single Page Application (SPA) built with React and Vite, currently transitioning to a NestJS backend.

**Current State:** Hybrid.
*   **Frontend:** Uses a **Service Layer** to mock data (in-memory).
*   **Backend:** NestJS foundation is set up (`/backend`) with a complete Prisma schema applied to the PostgreSQL database.

## Architecture

### Tech Stack
*   **Frontend:**
    *   React 18, Vite, TypeScript.
    *   TanStack Query (React Query) v5.
    *   Tailwind CSS, Shadcn/UI.
    *   React Router DOM (v6).
*   **Backend (New):**
    *   NestJS (Node.js framework).
    *   PostgreSQL (Database).
    *   Prisma (ORM).
    *   Zod (Validation).

### Directory Structure
*   `src/`: **Frontend Source**.
    *   `services/`: Service Layer (Currently mocks backend).
    *   `data/mockEvents.ts`: Initial mock data.
    *   `contexts/`: Global state (Auth, Theme).
    *   `components/`: UI Components.
*   `backend/`: **Backend Source**.
    *   `src/config/`: Environment validation (`env.ts`).
    *   `src/prisma/`: Database connection (`prisma.service.ts`).
    *   `src/health/`: Health check endpoint (`/health`).
    *   `prisma/`: Schema definitions (`schema.prisma`).

### Database Schema (Prisma)
The database is designed for multi-tenancy and atomic scanning operations.

*   **Core Models:**
    *   `Organization`: The tenant root. All events/tickets belong to an organization.
    *   `User`: Global users (can be members of multiple orgs).
    *   `OrganizationMember`: Links Users to Organizations with Roles (OWNER, ADMIN, STAFF).
*   **Event Domain:**
    *   `Event`: An event instance.
    *   `TicketType`: Tiers (VIP, General) defining price and quantity.
    *   `Gate`: Physical entry points for scanning.
*   **Sales & Access:**
    *   `Order`: A purchase transaction containing multiple items.
    *   `Ticket`: A single validatable asset with a unique QR code.
    *   `ScanLog`: Immutable audit trail of every scan attempt (Granted/Denied).
*   **Key Design Decisions:**
    *   **Currency:** All monetary values are stored as **Integer Cents** (e.g., 100 = 1.00).
    *   **Scanning:** Enforced via database constraints/transactions to prevent race conditions (double entry).

### Key Workflows (Frontend)

1.  **Data Access:**
    *   **Pattern:** Components/Pages -> React Query Hooks -> Services -> Mock Data.
    *   **Rule:** Pages MUST NOT import `mockEvents` directly. Use `useQuery` with `eventsService`.

2.  **Authentication & RBAC:**
    *   **Roles:** `admin`, `staff`, `user`.
    *   **Logic:** Roles are assigned based on email prefix during mock login (`admin@...` -> Admin).
    *   **Seed Data:** Initial mock orders and tickets are seeded for `admin@palticket.com`.

## Service Layer (Frontend Mock)

Currently, the frontend uses these services to simulate API calls.

*   `eventsService.ts`: Fetches events, categories, cities.
*   `ordersService.ts`: Handles order creation/retrieval.
*   `ticketsService.ts`: Handles ticket generation/retrieval.

## Building and Running

### Frontend
```bash
npm install       # Install dependencies
npm run dev       # Start development server
```

### Backend
Prerequisites: Docker (PostgreSQL).

```bash
cd backend
npm install       # Install dependencies
# Create .env from .env.example
npm run start:dev # Start NestJS server (http://localhost:3001)
# Database Tools
npm run prisma:generate # Generate Client
npm run prisma:migrate  # Run Migrations (already initialized)
npm run prisma:studio   # View Data UI
```

## Development Conventions

### Data Fetching
*   **Use React Query:** Do not use `useEffect` for data fetching.
*   **Query Keys:** Use descriptive keys (e.g., `["events", { category: "music" }]`).
*   **Mutations:** Always invalidate relevant queries in `onSuccess` callback.

### TypeScript & Linting
*   **Strictness:** Low (`noImplicitAny: false`). Be careful with type safety.
*   **Fast Refresh:** Keep component files pure. Move hooks and constants to separate files.

### Backend Standards
*   **Env Validation:** All env vars must be validated in `src/config/env.ts`.
*   **Prisma:** Use `PrismaService` for DB access.
*   **Health:** `/health` endpoint checks DB connectivity.

## Common Pitfalls
1.  **Direct Mock Access:** Do not import `mockEvents` in pages.
2.  **Persistence:** Frontend data currently vanishes on reload. Backend persistence is coming soon.