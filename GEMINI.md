# PalTicket Context Guide

## Project Overview
**PalTicket** is a bilingual (English/Arabic) event ticketing and discovery platform tailored for the Palestinian market. It is a Single Page Application (SPA) built with React and Vite.

**Current State:** Prototype / MVP.
**Note:** The backend is **mocked** via a Service Layer. Data resides in memory (simulated database) and resets on page reload.

### Tech Stack
*   **Core:** React 18, Vite, TypeScript.
*   **Data Fetching:** TanStack Query (React Query) v5.
*   **State Management:** React Context (`AuthContext` for Session), React Query (Server State).
*   **Styling:** Tailwind CSS, Shadcn/UI (Radix UI primitives).
*   **Routing:** React Router DOM (v6).
*   **Internationalization:** Custom implementation supporting LTR (English) and RTL (Arabic).

## Architecture

### Directory Structure
*   `src/services`: **Service Layer**. Wraps mock data with Promise-based APIs.
    *   `eventsService.ts`: Fetches events, categories, cities. Handles filtering.
    *   `ordersService.ts`: Handles order creation and retrieval.
    *   `ticketsService.ts`: Handles ticket generation and retrieval.
*   `src/types/domain.ts`: Shared TypeScript interfaces (`Event`, `MockOrder`, `MockUser`, etc.).
*   `src/data/mockEvents.ts`: **Database**. Contains the initial hardcoded data. Only services should import values from here.
*   `src/contexts`: **Global Contexts**.
    *   `AuthContext.tsx`: Session Provider.
    *   `useAuth.ts`: Auth hook (separated for linting compliance).
    *   `authUtils.ts`: Auth helpers (ID generation).
    *   `index.ts`: Export hub.
*   `src/i18n`: **Internationalization**.
    *   `LanguageContext.tsx`: Language Provider.
    *   `language-core.ts`: Context definition and hook.
*   `src/components/ui`: **UI Library**.
    *   Includes split files for lint compliance (e.g., `button-variants.ts`, `form-definitions.tsx`, `sidebar-context.tsx`).
*   `src/components/RouteGuards.tsx`: Route protection components (`RequireAdmin`, `RequireStaff`).

### Key Workflows

1.  **Data Access:**
    *   **Pattern:** Components/Pages -> React Query Hooks -> Services -> Mock Data.
    *   **Rule:** Pages MUST NOT import `mockEvents` directly. They must use `useQuery` with `eventsService`.

2.  **Authentication & RBAC:**
    *   **Roles:** `admin`, `staff`, `user`.
    *   **Logic:** Roles are assigned based on email prefix during mock login (`admin@...` -> Admin).
    *   **Guards:** Routes are protected by wrappers in `src/App.tsx`.
    *   **Seed Data:** Initial mock orders and tickets are seeded for `admin@palticket.com`.

3.  **Order Flow:**
    *   User selects tickets in `EventDetailPage`.
    *   `createOrder` mutation is called.
    *   `ordersService` appends order to local array.
    *   `ticketsService` generates tickets.
    *   Query Cache (`["orders"], ["tickets"]`) is invalidated to update `AccountPage`.

## Service Layer (API Reference)

Since there is no real backend, these services act as the API SDK. All return Promises with simulated latency (~300ms).

### Events (`src/services/eventsService.ts`)
*   `fetchAllEvents()`: Returns `Event[]`.
*   `fetchFeaturedEvents()`: Returns `Event[]` (featured only).
*   `fetchEventBySlug(slug)`: Returns `Event | undefined`.
*   `filterEvents(filters)`: Returns `Event[]` based on criteria.
*   `fetchCategories()`: Returns `Category[]`.
*   `fetchCities()`: Returns `City[]`.

### Orders (`src/services/ordersService.ts`)
*   `fetchOrdersByUser(userId)`: Returns `MockOrder[]`.
*   `createOrder(input)`: Creates a new order and triggers ticket generation. Returns `MockOrder`.

### Tickets (`src/services/ticketsService.ts`)
*   `fetchTicketsByUser(userId)`: Returns `MockTicket[]`.
*   `addTicketsForOrder(order)`: (Internal) Generates tickets for a new order.

## Building and Running

### Prerequisites
*   Node.js & npm/bun

### Commands
```bash
npm install       # Install dependencies
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run linting
```

## Development Conventions

### Data Fetching
*   **Use React Query:** Do not use `useEffect` for data fetching.
*   **Query Keys:** Use descriptive keys (e.g., `["events", { category: "music" }]`).
*   **Mutations:** Always invalidate relevant queries in `onSuccess` callback.

### TypeScript & Linting
*   **Types:** Define shared domain types in `src/types/domain.ts`.
*   **Strictness:** Low (`noImplicitAny: false`). Be careful with type safety.
*   **Fast Refresh:** Keep component files pure (export components only). Move hooks, variants, and constants to separate files to avoid lint warnings.

### Internationalization
*   **RTL:** Use `ltr:` and `rtl:` Tailwind modifiers (e.g., `ltr:ml-2 rtl:mr-2`) for direction-aware spacing.

## Common Pitfalls
1.  **Direct Mock Access:** Do not import `mockEvents` in pages. Use the Service Layer.
2.  **Persistence:** Data created during a session (Orders/Tickets) **vanishes on reload**.
3.  **Routing Hooks:** Import `useLocation`, `useNavigate` from `react-router-dom`. Use optional chaining for `location.state`.
