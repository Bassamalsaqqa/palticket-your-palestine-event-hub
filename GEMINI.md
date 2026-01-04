# PalTicket Context Guide

## Project Overview
**PalTicket** is a bilingual (English/Arabic) event ticketing + scanning + POS platform for Palestine. It is a Single Page Application (SPA) built with React and Vite, connected to a NestJS backend.

**Current State:** Phase 0 complete; Phase 1 starting.
*   **Frontend**: Connected to backend APIs for core domains with mock fallbacks.
*   **Backend**: Multi-tenant foundation, inventory enforcement (POS + non-POS), idempotency, throttling, scan log retention, export audit logging.

## Decision Lock-In (Production Intent)
- Tenant boundary: Organization.
- Every event belongs to exactly one organization.
- Access is evaluated as: JWT identity + x-organization-id + role + scope assignment.
- Shipping gate (non-negotiables):
  - No oversell under concurrency (DB row locks in a transaction; updateMany-only is insufficient).
  - Scoped scanning (event/gate assignments enforced).
  - Price immutability via versioning + order item snapshots.
  - POS idempotency (duplicate issuance prevention).
  - Audit + export logging (forensics, disputes, finance).

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

### Database Schema (Current)
*   **Core Models**: `Organization`, `User`, `OrganizationMember`.
*   **Event Domain**: `Event` (includes `imageUrl`), `Venue`, `TicketType`, `Gate`.
*   **Inventory**: `TicketTypeInventory` with capacity/sold/reserved.
*   **Payments**: `Payment` model with CASH/CARD, manual confirm flow.
*   **Audit**: `AuditLog` and `IdempotencyKey` for auditability.
*   **Access Control**: `ScanLog` records all entry attempts (`GRANTED` / `DENIED_*`).

### Schema Targets (Phase 1-2)
*   **Assignments**: EventStaffAssignment (+ optional GateAssignment).
*   **Pricing**: TicketTypePriceVersion + OrderItem snapshots.

## Operating Model (Target)
- **Platform roles**: PLATFORM_SUPERADMIN, PLATFORM_SUPPORT.
- **Org roles**: ORG_ADMIN, EVENT_MANAGER, SELLER, SCANNER, FINANCE.
  - Role Migration: ADMIN -> ORG_ADMIN, STAFF -> SELLER (compatibility mode).
- **Scope enforcement**: Role + org scope + EventStaffAssignment + optional GateAssignment.
- **Defaults**: SELLER restricted to assigned events; ORG_ADMIN can view all but scanning still requires assignment.

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
*   **Localization**: Use `getLocalizedText` from `src/i18n/localize.ts` for display.
*   **Auth Persistence**: Mock auth persists only when "Remember me" is checked; localStorage is optional and guarded.

## Roadmap (Phased)
Phase 0 - Stabilize foundation (complete)
- Inventory locking in POS + non-POS order creation using row locks.
- POS Idempotency-Key support with requestHash replay protection.
- Payment model + POS Cash/Card (manual reference with confirm endpoint).
- Export includes payment fields + audit log.
- Rate limiting enabled (global defaults and stricter limits for orders/scans).

Phase 1 - RBAC overhaul + scoped assignments (next)
- Roles expansion.
- EventStaffAssignment/GateAssignment.
- ScopeGuard for scans/orders/exports.

Phase 2 - Price versioning + governance
- TicketTypePriceVersion + OrderItem snapshots.

Phase 3 - Central policy enforcement
- EventPolicyService canSell/canScan/visibility.

Phase 4 - Security hardening & ops readiness
- Rate limits for auth and exports.
- Structured logging + dashboards.

Phase 5 - PSP integration + buyer foundations
- Payment provider integration + buyer endpoints.

## Current Priorities (Next Session)
1. Phase 1 kickoff: roles enum expansion and assignments.
2. Add EventStaffAssignment/GateAssignment + ScopeGuard.
3. Update admin/member flows to manage assignments.
4. Tests for scope leakage and assignment enforcement.

## Common Pitfalls
1.  **UUID vs Slug**: Always use UUIDs for relationships/updates and slugs for filtering/URLs.
2.  **Camera Lifecycle**: Ensure all media tracks are stopped (`track.stop()`) on component unmount or step change.
3.  **Mock Sync**: When updating domain types, ensure `mockEvents.ts` reflects new fields (e.g., `imageUrl`, `categorySlug`).
