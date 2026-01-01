# AGENTS

Purpose
- This file captures the current state, conventions, and key decisions for this repo so future sessions can continue work safely and consistently.

Repository
- Root: C:\Users\bassa\Documents\PalTickets\palticket-your-palestine-event-hub
- Frontend: Vite + React + TypeScript + Tailwind + shadcn/ui
- Routing: react-router-dom with /en and /ar namespaces
- State/query: React Query used across pages
- Backend: NestJS + Prisma + PostgreSQL in /backend

Auth and RBAC (mock)
- Auth is mock and role-based by email prefix:
  - admin: email starts with "admin"
  - staff: email starts with "staff"
  - user: any other email
- Protected routes:
  - Admin: /en/admin, /ar/admin (RequireAdmin)
  - Scanner: /en/scan, /ar/scan (RequireStaff)
- Unauthorized users are redirected to login with message and a "from" location for post-login redirect.

Auth implementation
- Auth provider: src/contexts/AuthContext.tsx
- Context definition: src/contexts/AuthContextDef.ts
- Hook: src/contexts/useAuth.ts
- Barrel exports: src/contexts/index.ts
- Deterministic user ID: src/contexts/authUtils.ts
  - Uses a simple hash to generate user IDs.
  - Collisions are possible but acceptable for mock/demo data.

Seeded demo data
- Orders/tickets seeded with a stable admin user ID (matches deterministic hash for admin@palticket.com).
- README.md and GEMINI.md mention that seeded data belongs to admin demo account.

Service layer (mocked APIs)
- Service layer wraps mock data in Promise-based functions with simulated latency.
- Files:
  - src/services/eventsService.ts
  - src/services/ordersService.ts
  - src/services/ticketsService.ts
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
- eslint runs clean (zero errors and warnings after recent refactors).

Open items and conventions
- Avoid re-exporting hooks from component files to keep react-refresh clean.
- Use ASCII by default in new files unless existing file already uses Unicode.
- Keep future changes aligned with the service layer and React Query for data access.

Common access for admin panel (mock)
- Use /en/login or /ar/login and sign in with admin email:
  - Email: admin@palticket.com
  - Password: 123456
- Staff access to scanner uses staff@palticket.com with the same password.

Notes
- The project is still mock-data driven; swapping to real APIs should be done by replacing services to call a backend and keeping React Query intact.

Backend architecture and rules
- Backend runtime: http://localhost:3001
- Database: PostgreSQL via Prisma (classic workflow)
- Tenant boundary: Organization
- RBAC: OrganizationMember with roles ADMIN/STAFF; unique(organizationId, userId)
- Money fields use integer cents; no floats/decimals
- Ticket scan-once enforced by Ticket.status and ScanLog
- All tenant-owned tables include organizationId or link to Event with organizationId; prefer explicit organizationId and indexes
- Global ValidationPipe enforces DTO validation (whitelist + forbidNonWhitelisted + transform)
- Domain modules: Events/Venues/Gates/TicketTypes CRUD; Orders/Tickets read-only
- **Services MUST use explicit Prisma `select`** to avoid over-fetching and leaking PII. Do not rely on default model return.
- **Pagination:** List endpoints must support `skip`/`take` via Query DTOs. Max take is 100.
- Scan endpoint: `POST /scan` with atomic update + ScanLog; invalid codes are not logged (ticketId FK required).
- Orders: `POST /orders` creates Order + OrderItems + Tickets in a transaction; tickets get unique codes.
- Currency: Order currency derived from TicketTypes; helper `backend/src/common/currency.ts` maps currency to symbol.

Role separation
- Gemini: generates bulk changes or scaffolding
- Codex: reviews, hardens, and migrates
