# PalTicket

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Overview
PalTicket is a bilingual event ticketing platform for Palestine.

## Getting Started

### Prerequisites
*   Node.js & npm (or Bun)

### Installation
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

## Authentication & Roles (Mock System)

The application uses a mock authentication system. Access control is determined by the email prefix used during login.

| Role | Access Level | Email Pattern | Example Login |
|------|-------------|---------------|---------------|
| **Admin** | Full access to Admin Dashboard, Scanner, and User features. | Starts with `admin` | `admin@palticket.com` |
| **Staff** | Access to Scanner and User features. | Starts with `staff` | `staff@event.com` |
| **User** | Access to public events and personal account only. | Any other email | `user@example.com` |

**Seed data available for admin@palticket.com.**

**Password:** Any string with 6+ characters (e.g., `123456`).

## Development Architecture

This project uses a **Service Layer** to decouple the UI from the mock data source.

*   **Services:** Located in `src/services/`. All data fetching goes through here.
*   **Data Fetching:** We use **React Query** (`useQuery`, `useMutation`) for all async operations.
*   **Mock Data:** `src/data/mockEvents.ts` serves as the initial database.
*   **Types:** Shared types are in `src/types/domain.ts`.

**Important:** Do not import `mockEvents` directly into UI components. Use the services.

## Technologies

- **Framework:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State/Query:** TanStack Query (React Query)
- **Routing:** React Router DOM v6

## Code Quality

The project adheres to strict **ESLint** rules, including `react-refresh/only-export-components`. Code is structured to separate components from hooks, contexts, and utility functions to ensure Fast Refresh works reliably.

## Known Issues & Troubleshooting

*   **Login Page White Screen:** A previous issue causing a white screen on the login page (due to missing `useLocation` import) has been resolved. Ensure you are using the latest version of `src/pages/LoginPage.tsx`.
*   **Data Persistence:** Since there is no real backend, created orders and tickets will disappear if you refresh the browser page.

## Deployment

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.
