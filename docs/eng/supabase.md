# Supabase

DameRide uses Supabase as its main backend. The client lives in `src/lib/supabase.ts` and is lazily initialized to avoid issues during static rendering.

## Supabase Client

Variables used by the mobile client:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

On native platforms, the session is persisted with AsyncStorage. On web, the default browser storage is used. `detectSessionInUrl` is disabled because the OAuth response is handled manually.

## Auth

Supabase Auth is used for email/password and Google OAuth. The `on_auth_user_created` trigger creates the initial profile in `profiles`.

## Database

App tables:

- `profiles`
- `vehicles`
- `rides`
- `reservations`
- `ratings`

The app accesses the database through `src/lib/database.ts`.

## Storage

| Bucket | Use | Public | Limit | MIME types |
| --- | --- | --- | --- | --- |
| `avatars` | Profile photos | Yes | 1 MiB | JPEG, PNG, WebP |
| `vehicles` | Vehicle photos | Yes | 2 MiB | JPEG, PNG, WebP |

## Row Level Security

RLS is enabled on public app tables. Policies allow public reads where the product needs them and restrict writes to owners: own profiles, own vehicles, own rides, and passenger reservations.

## Migrations

Migrations live in `supabase/migrations/` and include extensions, tables, constraints, indexes, functions, triggers, RLS, Storage, and Realtime. Do not apply the clean migration chain to the current hosted project without reconciling remote migration history first.

## Seeds

There is no active seed. `supabase/seed.sql` was removed and `supabase/config.toml` has seeds disabled. A clean rebuild creates structure, not runtime data.

## Generated Types

`src/types/supabase.ts` is generated from local Supabase with:

```bash
npm run supabase:types
```

## Public Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback
```

## Private Variables

```bash
GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

These variables are for local Google provider configuration in Supabase CLI and must not be exposed in the mobile client.

## Mobile Client Security

- Only use anon/publishable keys in Expo.
- Never include `SUPABASE_SERVICE_ROLE_KEY` in React Native.
- Do not document real secrets.
- Keep RLS policies as the main access control layer.
- Review OAuth and redirect URLs in the Dashboard for each environment.
