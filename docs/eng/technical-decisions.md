# Technical Decisions

## Expo Router

Navigation uses file-based routes in `app/`. This simplifies tabs, auth routes, modal-like screens, and dynamic routes such as `ride/[id]`.

## Supabase as Backend

Supabase centralizes Auth, Postgres, Storage, and Realtime. This enables a complete backend with SQL migrations and generated TypeScript types.

## RLS and RPCs for Reservations

Reservations use SQL functions (`reserve_seat`, `cancel_reservation`) to keep consistency: validate authenticated users, lock rows, avoid overbooking, and restore seats on cancellation.

## PostGIS for Nearby Search

Rides store coordinates and geography columns. Nearby search is handled in the database with `st_dwithin` and distance calculations.

## Public Storage Controlled by Folder

Image buckets are public to simplify rendering in the app, while writes are restricted to folders whose first segment is `auth.uid()`.

## Separate Types

The project keeps `src/types/database.ts` for UI domain types and `src/types/supabase.ts` for generated database types.

## No Seeds in Recovery

The seed was removed so `supabase/` stays a clean source for infrastructure rebuilds and does not mix test data with migrations.

