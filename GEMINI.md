# PalTicket Context Guide

## Project Overview
**PalTicket** is a bilingual (English/Arabic) event ticketing and discovery platform tailored for the Palestinian market. It is a Single Page Application (SPA) allowing users to browse events, "purchase" tickets, and manage their account.

**Current State:** Prototype / MVP.
**Note:** The backend is **fully mocked**. There is no real database connection. All data resides in memory and resets on reload.

### Tech Stack
*   **Core:** React 18, Vite, TypeScript.
*   **Styling:** Tailwind CSS, Shadcn/UI (Radix UI primitives).
*   **State Management:** React Context (`AuthContext`, `LanguageContext`), TanStack Query.
*   **Routing:** React Router DOM (v6).
*   **Internationalization:** Custom implementation supporting LTR (English) and RTL (Arabic).

## Architecture

### Directory Structure
*   `src/data/mockEvents.ts`: **CRITICAL**. This file acts as the database, schema definition, and query layer. It contains the hardcoded list of events, cities, and categories.
*   `src/contexts`: Contains global state.
    *   `AuthContext.tsx`: Simulates authentication (login/signup) and holds session state (User, Orders, Tickets).
    *   `LanguageContext.tsx` (`src/i18n`): Manages language switching and direction (RTL/LTR).
*   `src/pages`: Route components.
    *   `src/pages/admin`: Visual shell for admin features (functionality is stubbed).
    *   `EventDetailPage.tsx`: Contains heavy business logic for ticket selection and cart calculation.
*   `src/components/ui`: Shadcn/UI reusable components.

### Key Workflows
1.  **Data Access:** Components import `mockEvents` directly or use helper functions like `getEventBySlug` from `src/data/mockEvents.ts`.
2.  **Authentication:** `AuthContext` provides `login` and `signup` methods.
    *   **Roles:** Roles are assigned based on email prefix: `admin...` -> Admin, `staff...` -> Staff, others -> User.
    *   **Guards:** `RequireAdmin`, `RequireStaff`, and `RequireAuth` (in `src/components/RouteGuards.tsx`) protect routes.
3.  **Checkout:** Logic is local to `EventDetailPage`. It validates inputs and generates a random order ID without persisting to a backend.

## Building and Running

### Prerequisites
*   Node.js & npm/bun

### Commands
*   **Install Dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```
*   **Start Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Linting:**
    ```bash
    npm run lint
    ```

## Development Conventions

### Styling
*   Use Tailwind utility classes.
*   **RTL Support:** Use logical properties or specific direction prefixes (e.g., `ltr:ml-2 rtl:mr-2`) for all spacing and positioning to ensure correct layout in Arabic mode.

### TypeScript
*   **Strictness:** Low. `noImplicitAny` is set to `false`. Be careful with type safety, as explicit types are not always enforced by the compiler.
*   **Icons:** Use `lucide-react`.

### Common Pitfalls
1.  **Mock Data:** Changes to `src/data/mockEvents.ts` are effectively schema changes. There is no separation between data and type definitions.
2.  **Persistence:** "Orders" created during a session will vanish upon page refresh.
3.  **Admin Panel:** The admin routes (`/admin`) exist but the CRUD operations are purely visual (toast notifications only).
4.  **I18n:** Always wrap text in the translation helper `t.key.path` or ensure it comes from the dynamic data structure which has `en` and `ar` fields.
5.  **Routing:** When using `useLocation` or other router hooks in pages, ensure they are imported from `react-router-dom`. Type casting `location.state` might be necessary as it defaults to `unknown`.

## Future Roadmap (Inferred)
*   Replace `mockEvents.ts` and `AuthContext` with a real backend (Node.js/Firebase/Supabase).
*   Implement real payment gateway integration.
*   Migrate `EventDetailPage` cart logic to a global store (Context or Redux) to support multi-event carts.
