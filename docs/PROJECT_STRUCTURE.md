# Project Structure

## Root: `magnevents-platform/`

The main monorepo structure containing all the platforms, databases, and helper utilities.

### 1. `booking-platform/` (Client Portal)
The main client-facing Next.js application where users can discover artists, request bookings, and read blogs.
- `app/`: Next.js 15 App Router directory (pages, layouts).
- `app/api/`: API endpoints for contact forms, analytics, etc.
- `app/components/`: Reusable React components grouped by feature (home, artists, common).
- `app/hooks/`: Custom React hooks (e.g., `useArtists.js`, `useBooking.js`).
- `app/services/`: Service layer handling API logic (e.g., `contact.service.js`).

### 2. `admin-portal/` (Admin Dashboard)
The internal portal for managing bookings, artists, content, and analytics.
- `app/`: Next.js 15 App Router directory.
- `components/`: UI components for the admin interface.

### 3. `database/`
Centralized database connections and schemas.
- `connection/`: Shared Supabase/DB connection instances.
- **Note**: Both portals access the database via aliased imports (e.g. `@database/`).

### 4. `helpers/`
Shared utility functions, formatting logic, and scripts used across the workspace.
- `url.js`: Centralized URL builders for consistent routing.
- `scripts/`: Utility and maintenance scripts (e.g., refactoring scripts, data migrations).
- `archive/`: Storage for deprecated or unused files to preserve history safely.

## Key Configuration
Both `booking-platform` and `admin-portal` utilize `jsconfig.json` to resolve paths like `@helpers/` and `@database/` to the root workspace folders, ensuring DRY code across platforms.
