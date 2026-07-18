# Database Architecture

## Supabase PostgreSQL

The platform relies on Supabase as its primary PostgreSQL database, accessed via the `@supabase/supabase-js` client.

### Connection Handling
Connections are initialized globally in `database/connection/supabase.js` to ensure a single singleton instance is used across the Next.js API routes and Client Components. 
This prevents connection pooling exhaustion and unifies API keys management.

### Key Models & Collections
- `artists`: Core artist profiles, containing categories, prices, ratings, and bios.
- `artist_images`: Image gallery corresponding to `artists`.
- `bookings`: User requests for bookings, call requests, and artist registrations.
- `profiles`: Administrative users (agents) managing the platform.

### Future Extensibility
By isolating the DB layer in `database/`, both `booking-platform` and `admin-portal` are decoupled from specific framework data-fetching mechanisms, enabling seamless future migrations.
