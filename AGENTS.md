# AGENTS

Purpose
- This file captures the current state, conventions, and key decisions for this repo so future sessions can continue work safely and consistently.

Decision Lock-In (Production Intent)
- Tenant boundary: Organization.
- Every event belongs to exactly one organization.
- Access is evaluated as: JWT identity + x-organization-id + role + scope assignment.
- Do not ship production until all are true:
  - No oversell under concurrency (DB row locks in a transaction; updateMany-only is insufficient).
  - Scoped scanning (event/gate assignments enforced).
  - Price immutability via versioning + order item snapshots.
  - POS idempotency (duplicate issuance prevention).
  - Audit + export logging (forensics, disputes, finance).

Repository
- Root: C:\Users\bassa\Documents\PalTickets\palticket-your-palestine-event-hub
- Frontend: Vite + React + TypeScript + Tailwind + shadcn/ui
- Routing: react-router-dom with /en and /ar namespaces
- State/query: React Query used across pages
- Backend: NestJS + Prisma + PostgreSQL in /backend

Auth and RBAC
- Frontend auth is mock and role-based by email prefix:
  - admin: email starts with "admin"
  - staff: email starts with "staff"
  - user: any other email
- Auth persistence uses localStorage only when "Remember me" is enabled.
- Backend auth is real (JWT) and scoped by organization membership.
- Protected routes:
  - Admin: /en/admin, /ar/admin (RequireAdmin)
  - Scanner: /en/scan, /ar/scan (RequireStaff)
  - Account: /en/account, /ar/account (RequireAuth)
- Invite acceptance: `/en/accept-invite` and `/ar/accept-invite` use a token in the query string; backend `POST /members/invites/accept` requires JWT only (no x-organization-id).
- Unauthorized users are redirected to login with message and a "from" location for post-login redirect.

Target Roles and Scoping (Phase 1)
- Platform roles: PLATFORM_SUPERADMIN (cross-tenant full access), PLATFORM_SUPPORT (cross-tenant read-only + allowlist ops).
- Org roles: ORG_ADMIN, EVENT_MANAGER, SELLER, SCANNER, FINANCE.
- Scope enforcement: Role + org scope (mandatory) + EventStaffAssignment, optionally GateAssignment.
- Defaults: SELLER restricted to assigned events; ORG_ADMIN can view everything but scanning still requires assignment.

Auth implementation
- Auth provider: src/contexts/AuthContext.tsx
- Context definition: src/contexts/AuthContextDef.ts
- Hook: src/contexts/useAuth.ts
- Barrel exports: src/contexts/index.ts
- Deterministic user ID: src/contexts/authUtils.ts
  - Uses a simple hash to generate user IDs.
  - Collisions are possible but acceptable for mock/demo data.

Seeded demo data
- Backend seed: `backend/prisma/seed.ts` embeds a demo list (UTF-8 Arabic + English).
- Mock events: `src/data/mockEvents.ts` is generated from `public/English.json` + `public/Arabic.json`.
  - Do not hand-edit mockEvents; update the JSON sources and re-generate using the repo's generator workflow.
  - Prefer the `getLocalizedText` helper for localized UI displays (`src/i18n/localize.ts`).
- Orders/tickets seeded with a stable admin user ID (matches deterministic hash for admin@palticket.com).

Service layer (mocked + real APIs)
- Service layer wraps mock data in Promise-based functions with simulated latency.
- When API config is present, services call the backend and fall back to mock data on failure.
- API config (frontend): `VITE_API_BASE_URL`, `VITE_API_TOKEN`, `VITE_ORGANIZATION_ID` (or localStorage overrides).
- Org-independent calls use `getApiAuthConfig` + `apiFetchPublic` (base URL + token only); invite acceptance relies on this path.
- Files:
  - src/services/eventsService.ts
  - src/services/ordersService.ts
  - src/services/ticketsService.ts
  - src/services/gatesService.ts
  - src/services/ticketTypesService.ts
  - src/services/venuesService.ts
  - src/services/scansService.ts
  - src/services/membersService.ts
  - src/services/usersService.ts
- Pages use React Query to call services (Home, Discover, EventDetail, Account, Admin modules, Scanner, PastEvents).

Domain types
- Central types live in src/types/domain.ts
- Orders/tickets include userId, attendeeName, eventTime, and are filtered by userId.

Routing and redirects
- Login/Signup redirect to location.state.from if present, otherwise to /{lang}/account.
- Route guards use language to localize messages.

UI and lint refactors
- Variants extracted to avoid react-refresh warnings:
  - src/components/ui/button-variants.ts
  - src/components/ui/badge-variants.ts
  - src/components/ui/toggle-variants.ts
- Sidebar and form contexts extracted:
  - src/components/ui/sidebar-context.tsx
  - src/components/ui/form-definitions.tsx
- Language context extracted:
  - src/i18n/language-core.ts
- Password placeholder now in translations:
  - src/i18n/translations.ts -> t.auth.passwordPlaceholder

Lint status
- Root lint covers both frontend and backend (backend/dist is ignored).
- eslint runs clean (zero errors and warnings after recent refactors).

Backend architecture and rules
- Backend runtime: http://localhost:3001
- Database: PostgreSQL via Prisma (classic workflow)
- Tenant boundary: Organization
- RBAC: OrganizationRole (ORG_ADMIN, EVENT_MANAGER, SELLER, SCANNER, FINANCE)
  - Migration Mapping: ADMIN -> ORG_ADMIN, STAFF -> SELLER.
  - Compatibility Note: SELLER temporarily retains staff/scanner access until Phase-1 ScopeGuard/assignments.
- Money fields use integer cents; no floats/decimals
- Ticket scan-once enforced by Ticket.status and ScanLog
- All tenant-owned tables include organizationId or link to Event with organizationId; prefer explicit organizationId and indexes
- Global ValidationPipe enforces DTO validation (whitelist + forbidNonWhitelisted + transform)
- Domain modules:
  - Events/Venues/Gates/TicketTypes CRUD (Events use translations; slug endpoint: `GET /events/slug/:slug?lang=en|ar`)
  - Categories/Cities read-only (global + org-specific, localized via `?lang=en|ar`)
  - Orders create + read; Tickets read-only
  - Members: invite-by-email via `/members/invites`, accept via `/members/invites/accept` (JWT only)
  - Assignments: `POST /events/:id/assignments`, `POST /gates/:id/assignments` (ORG_ADMIN only)
  - Scan logs: `GET /scan/logs` (admin/staff), `POST /scan`
  - Exports: `GET /exports/orders.csv`, `GET /exports/tickets.csv`
- **Services MUST use explicit Prisma `select`** to avoid over-fetching and leaking PII.
- **Pagination:** List endpoints must support `skip`/`take` via Query DTOs. Max take is 100.
- **Idempotency:** `POST /orders` supports `Idempotency-Key` scoped by org/user/method/path. Replay must be consistent; mismatch returns 409.
- Rate Limiting: ThrottlerGuard enabled globally. Default: 100/min. Orders: 5/min. Scans: 60/min.
- **Inventory:** Enforce with transaction + row locks; updateMany-only is not sufficient for concurrency safety.
- **Log Retention:** `ScansCleanupService` runs daily at midnight to delete logs > 6 months.
- **ScanLog Indexing:** Composite index on `organizationId, scannedAt` for log queries and cleanup.
- Scan endpoint: `POST /scan` with atomic update + ScanLog; invalid codes are not logged (ticketId FK required).
- Orders: `POST /orders` creates Order + OrderItems + Tickets in a transaction; tickets get unique codes.
- Non-POS orders issue PENDING tickets until payment is confirmed.
- Scan requests must include `eventId` in the body (required for assignment enforcement).
- Currency: Order currency derived from TicketTypes; helper `backend/src/common/currency.ts` maps currency to symbol.
- Seed data: `backend/prisma/seed.ts` contains an embedded demo list and creates a demo org/user plus venues, cities, events, and ticket types.
- Admin UI: Event, Ticket Type, and Gate creation forms are wired to backend APIs.
- Admin UI: Ticket Types/Gates editing are wired; Users/Roles/Staff editing and member invites/deletes are wired.
- Admin UI: Order details modal, audit logs, and exports are wired.
- Image upload: `POST /events/:id/image` with storage settings in backend `.env`.
- Storage config: `STORAGE_DRIVER`, `STORAGE_LOCAL_ROOT`, `STORAGE_PUBLIC_URL` (local disk default).
- Exports: `/exports/orders.csv` and `/exports/tickets.csv` support optional `eventId` filtering.
- **ScopeGuard:** Enforced on `/ops/orders` (Event assignment required) and `/scan` (Event + Gate assignment required). ORG_ADMIN bypasses.

Prisma configuration
- Prisma config lives in `backend/prisma.config.ts` and loads env vars via `dotenv/config` (uses `@prisma/config` devDependency).

Roadmap (Phased)
- Phase 0: Inventory + POS idempotency + payment model + export audit logging (complete).
- Phase 1: Roles expansion + EventStaffAssignment/GateAssignment + ScopeGuard + Admin UI (complete).
- Phase 2: Price versioning + order item snapshots (complete). Pricing policy enforcement pending.
- Phase 3: EventPolicyService enforcement + centralized status/visibility rules.
- Phase 4: Security hardening + ops readiness.
- Phase 5: PSP integration + buyer foundations.

Open items and conventions
- Avoid re-exporting hooks from component files to keep react-refresh clean.
- Use ASCII by default in new files unless existing file already uses Unicode.
- Keep future changes aligned with the service layer and React Query for data access.
- Phase 3 focus: enforce event status via EventPolicyService; tighten FINANCE role usage for confirm-payment and exports; expand audit logging (role changes, event status changes, ticket voids).
- Migration note (dev): if price versioning migration fails on existing data, follow the manual backfill steps in `backend/README.md`.

Common access for admin panel (mock)
- Use /en/login or /ar/login and sign in with admin email:
  - Email: admin@palticket.com
  - Password: 123456
- Staff access to scanner uses staff@palticket.com with the same password.

Notes
- The project uses backend APIs when API config is provided; otherwise it falls back to mock data.
- Invite acceptance requires live API config (base URL + token) and is blocked in Mock Mode with a UI warning.
- Scanner uses camera access; mobile browsers require HTTPS or localhost for camera permissions.
- Scanner includes manual entry, session export, and camera control buttons.
- Localization: backend returns translations for requested locale; fallback behavior is limited.

## API Configuration Precedence
The application resolves its data source in the following order:
1. **Force Mock Flag**: If "Force Mock Mode" is enabled in Admin Settings, all other configs are ignored.
2. **Local Storage Overrides**: Values manually set in the Admin Settings UI take precedence over environment variables.
3. **Environment Variables**: `VITE_API_BASE_URL`, etc., defined in the `.env` file.
4. **Fallback**: Default mock data.

Role separation
- Gemini: generates bulk changes or scaffolding
- Codex: reviews, hardens, and migrates

Session startup (copy/paste at the top of a new session)
- "You are Codex CLI. You review/validate; Gemini generates."
- "Do not modify frontend unless explicitly requested."
- "Respect tenant scoping, RBAC, integer cents, and scan-once rules."
- "Use AGENTS.md + README.md as the source of truth for current state."
