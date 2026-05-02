# Architecture

DameRide is organized as an Expo Router app with a UI layer in `app/`, a shared layer in `src/`, and declarative backend setup in `supabase/`.

## Main Layers

| Layer | Location | Responsibility |
| --- | --- | --- |
| Navigation and screens | `app/` | Routes, tabs, auth, profile, ride details, and onboarding. |
| Components | `src/components/` | Reusable UI, cards, maps, states, and controls. |
| State and hooks | `src/hooks/` | Session, profile, and realtime subscriptions. |
| Services | `src/lib/` | Supabase client, auth, database, and storage. |
| Auth feature | `src/features/auth/` | Google sign-in, button, and OAuth hook. |
| Types | `src/types/` | Domain types and generated Supabase types. |
| Backend | `supabase/` | Local config, migrations, and recovery docs. |

## Authentication Flow

`app/_layout.tsx` wraps the app with `AuthProvider`. Depending on session state and `profile.onboarding_completed_at`, it redirects to login, onboarding, or tabs.

`src/hooks/useAuth.tsx` listens to Supabase Auth changes and loads the user profile from `profiles`.

## Data Flow

Screens use functions from `src/lib/database.ts` to read or modify profiles, vehicles, rides, and reservations. File operations use `src/lib/storage.ts`.

## Realtime

`src/hooks/useRealtime.ts` subscribes to Postgres changes for `rides` and `reservations`. Migrations add those tables to the `supabase_realtime` publication when it exists.

## Maps and Routes

Map components use `react-native-maps` on native and `.web.tsx` fallback variants on web. `src/utils/maps.ts` calculates routes with OSRM and a Valhalla fallback, then stores polyline, distance, and duration in `rides`.
