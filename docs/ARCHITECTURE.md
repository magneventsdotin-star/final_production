# Architecture Principles

The `magnevents-platform` follows the principles of Clean Architecture and SOLID to ensure maintainability and modularity across the monolithic repository.

## 1. Separation of Concerns (SoC)
- **UI Components:** React components in `app/components/` strictly handle UI rendering and user interactions.
- **Hooks:** Custom hooks in `app/hooks/` (e.g., `useArtists.js`) extract state management and data-fetching logic away from the view layer, enabling component reuse.
- **Services:** Complex business logic, external API integrations, and email builders are isolated in `app/services/` (e.g., `contact.service.js`).

## 2. DRY (Don't Repeat Yourself)
- **Shared Helpers:** The `helpers/` folder at the root contains utility files (`url.js`) which store hardcoded path logic in a single source of truth.
- **Shared Database:** The `database/` folder prevents redefining schemas and DB connection singletons across the admin and booking portals.

## 3. Server-Client Boundaries (Next.js 15)
- **Client Boundaries:** Components utilizing `useEffect`, `useState`, and browser APIs explicitly declare `"use client"`.
- **Server Boundaries:** Next.js App Router API routes (`route.js`) securely interface with `process.env` and the service layer.

## 4. Scalability
By standardizing imports through paths (e.g. `@helpers/`, `@database/`), the codebase can effortlessly support new micro-applications (e.g. `vendor-portal`) seamlessly integrated with the same underlying core logic.
