# PalTicket Context Guide

## Project Overview
**PalTicket** is a bilingual (English/Arabic) event ticketing and discovery platform tailored for the Palestinian market. It is a Single Page Application (SPA) built with React and Vite, connected to a NestJS backend.

**Current State:** Fully Integrated.
*   **Frontend**: Connected to backend APIs for all core domains (Events, Orders, Tickets, Admin Management, Scanning).
*   **Backend**: Production-ready NestJS foundation with organized storage, organizational isolation, and comprehensive audit logging.

## Architecture

### Tech Stack
*   **Frontend**: React 18, Vite, TypeScript, TanStack Query v5, Tailwind CSS, Shadcn/UI.
*   **Backend**: NestJS, PostgreSQL, Prisma, Passport (JWT), Zod/Class-validator.
*   **Storage**: Organization-scoped local storage abstraction with organized asset paths.

### Directory Structure
*   `src/`: **Frontend Source**.
    *   `services/`: Service Layer with API-first logic and mock fallbacks.
    *   `data/mockEvents.ts`: Standardized mock data with valid UTF-8 Arabic content.
*   `backend/`: **Backend Source**.
    *   `src/common/storage.service.ts`: Storage abstraction for file uploads.
    *   `src/exports/`: CSV generation and data portability.
    *   `src/members/`, `src/users/`: Organizational membership and profile management.

### Database Schema (Prisma)
*   **Core Models**: `Organization`, `User`, `OrganizationMember`.
*   **Event Domain**: `Event` (includes `imageUrl`), `Venue`, `TicketType`, `Gate`.
*   **Taxonomy**: `Category` and `City` using slugs for filtering and UUIDs for relations.
*   **Access Control**: `ScanLog` records all entry attempts (`GRANTED` / `DENIED_*`).

## Key Workflows

### 1. Asset Management (Images)
*   **Backend**: `StorageService` builds paths like `/YYYY/event-slug/`.
*   **Validation**: 5MB limit, restricted to `png`, `jpg`, `jpeg`, `webp`.
*   **UI**: Admins can upload/replace cover images directly in the event management dialog.

### 2. Administrative Suite
*   **Entity Management**: Full CRUD for Events, Ticket Types, and Gates.
*   **Membership**: `ADMIN` can update member roles and edit user profiles (tenant-safe).
*   **Reporting**: Dashboard metrics and tenant-scoped CSV exports for orders and tickets.

### 3. Entry Control (Scanner)
*   **UX**: Hardware controls (Stop/Switch camera), status indicators, and manual entry.
*   **Session**: Exportable scan history (CSV) with robust data escaping.
*   **Atomicity**: Single-use entry enforced via database transactions.

### 4. Search & Discovery
*   **Consistency**: Filters (Category/City) utilize slugs in URL search params.
*   **Mapping**: Service layer maps `categorySlug` and `citySlug` for reliable filtering across API and mock modes.

## Service Layer

*   `eventsService.ts`: Localized fetching + image support + slug-based filtering.
*   `membersService.ts`: Membership and role management.
*   `usersService.ts`: User profile updates (name, phone).
*   `scansService.ts`: Audit log retrieval and result mapping.

## Development Conventions

### Data Safety
*   **Tenant Boundary**: All admin/staff operations *must* be scoped to `x-organization-id`.
*   **PII Privacy**: Use explicit Prisma `select` to exclude sensitive fields (passwords, etc.).

### UI Patterns
*   **React Query**: Always invalidate appropriate keys (`["adminEvents"]`, `["admin", "members"]`) on success.
*   **Localization**: Use `\u` escapes or valid UTF-8 for Arabic content; avoid mojibake separators.
*   **Localized Display**: Prefer `getLocalizedText` from `src/i18n/localize.ts` instead of direct `name[language]` access.
*   **Auth Persistence**: Mock auth persists only when "Remember me" is checked; localStorage is optional and guarded.

## Current Priorities (Next Session)
1. Verify tenant isolation for admin and export endpoints.
2. Confirm idempotency replay and throttling via E2E tests.
3. Review CSV export PII minimization requirements.
4. Continue payments/notifications roadmap after security hardening.

## Common Pitfalls
1.  **UUID vs Slug**: Always use UUIDs for relationships/updates and slugs for filtering/URLs.
2.  **Camera Lifecycle**: Ensure all media tracks are stopped (`track.stop()`) on component unmount or step change.
3.  **Mock Sync**: When updating domain types, ensure `mockEvents.ts` is updated to reflect new fields like `imageUrl` or `categorySlug`.
