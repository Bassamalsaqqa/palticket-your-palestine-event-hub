# PalTicket Context Guide

## Project Overview
**PalTicket** is a bilingual (English/Arabic) event ticketing and discovery platform tailored for the Palestinian market. It is a Single Page Application (SPA) built with React and Vite, connected to a NestJS backend.

**Current State:** Hybrid / Integrated.
*   **Frontend:** Connected to backend APIs for Events, Orders, and Tickets with automatic mock data fallback if API configuration is missing or unavailable.
*   **Backend:** Fully functional NestJS application (`/backend`) with Prisma, PostgreSQL, JWT Authentication, and RBAC.

## Architecture

### Tech Stack
*   **Frontend:**
    *   React 18, Vite, TypeScript.
    *   TanStack Query (React Query) v5.
    *   Tailwind CSS, Shadcn/UI.
    *   React Router DOM (v6).
*   **Backend:**
    *   NestJS (Node.js framework).
    *   PostgreSQL (Database).
    *   Prisma (ORM).
    *   Passport (JWT Auth).
    *   Class-validator (Validation).

### Directory Structure
*   `src/`: **Frontend Source**.
    *   `services/`: Service Layer (Calls backend APIs with mock fallbacks).
    *   `data/mockEvents.ts`: Fallback/Seed mock data.
    *   `contexts/`: Global state (Auth, Theme).
    *   `components/`: UI Components.
*   `backend/`: **Backend Source**.
    *   `src/auth/`: Authentication & RBAC (`auth.service.ts`, `roles.guard.ts`).
    *   `src/events/`, `src/orders/`, `src/tickets/`, `src/scans/`: Domain modules.
    *   `src/categories/`, `src/cities/`: Taxonomy modules.
    *   `src/venues/`: Venue management with localization.
    *   `prisma/`: Schema definitions and migrations.

### Database Schema (Prisma)
The database is designed for multi-tenancy, localization, and atomic scanning operations.

*   **Core Models:**
    *   `Organization`: The tenant root. All events/tickets belong to an organization.
    *   `User`: Global users.
    *   `OrganizationMember`: Links Users to Organizations with Roles (ADMIN, STAFF).
*   **Event Domain:**
    *   `Event` & `Venue`: Support multi-locale translations (English/Arabic).
    *   `Category` & `City`: Taxonomy with global and tenant-specific entries.
    *   `TicketType`: Tiers (VIP, General) defining price and quantity.
*   **Sales & Access:**
    *   `Order`: Stores purchase details and `attendeeName`.
    *   `Ticket`: Unique assets with QR codes.
    *   `ScanLog`: Immutable audit trail for every entry attempt.
*   **Key Design Decisions:**
    *   **Currency:** Stored as **Integer Cents** (e.g., 100 = 1.00).
    *   **Scanning:** Atomic transactions prevent double-entry.

### Key Workflows (Backend)

1.  **Authentication:**
    *   **Method:** JWT (Bearer Token).
    *   **Endpoints:** `/auth/login`, `/auth/me`.

2.  **RBAC & Multi-tenancy:**
    *   **Guard:** `RolesGuard` enforces `x-organization-id` and role permissions.
    *   **Filtering:** All data is scoped to the organization provided in headers.

3.  **Localization:**
    *   **Implementation:** Translation tables for `Event`, `Venue`, `Category`, and `City`.
    *   **Usage:** Query parameter `?lang=en|ar` determines returned content.

## Service Layer (Integrated)

The frontend services act as a bridge between the UI models and the backend APIs.

*   `eventsService.ts`: Fetches localized events, categories, and cities.
*   `ordersService.ts`: Handles order creation and historical retrieval.
*   `ticketsService.ts`: Manages ticket retrieval and status mapping.
*   `gatesService.ts`, `ticketTypesService.ts`, `venuesService.ts`: Admin CRUD helpers with API + mock fallback.
*   `adminService.ts`, `membersService.ts`, `scansService.ts`: Admin dashboards and audit logs.
*   **Fallback Logic:** Services use `apiClient.ts` to check for configuration. If `VITE_API_BASE_URL` is missing or the request fails, they fall back to in-memory mock data.

## Building and Running

### Full Stack
1.  **Backend:**
    ```bash
    cd backend
    npm install
    # Set .env (DATABASE_URL, JWT_SECRET, etc.)
    npm run prisma:migrate
    npm run start:dev
    ```
2.  **Frontend:**
    ```bash
    npm install
    # Set environment variables for API connection
    npm run dev
    ```

## Development Conventions

### Linting
*   **Unified:** Root ESLint configuration covers both frontend and backend (`/backend/src`).
*   **Rules:** Strict TypeScript and React rules enforced. Use `npm run lint` at the root.

### UI Notes
*   **Scanner:** Uses camera access on the scan page, skips login when already authenticated (ADMIN/STAFF).
*   **Admin Forms:** Events, Ticket Types, and Gates creation are wired to backend APIs.
*   **Exports:** Admin exports support optional `eventId` filtering.

### Backend Standards
*   **DTOs:** Use `@IsIn(['en', 'ar'])` for locale validation.
*   **Services:** Use explicit Prisma `select` to avoid leaking PII and over-fetching.
*   **Security:** `RolesGuard` must be applied to all tenant-scoped routes.

## Common Pitfalls
1.  **Route Shadowing:** In controllers, ensure static or specific routes (like `/slug/:slug`) are defined *above* generic ID routes (`/:id`).
2.  **Explicit Any:** Avoid `any` in service mappings; define appropriate `ApiResult` types.
