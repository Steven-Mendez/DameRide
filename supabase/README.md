# Supabase Backend Recovery

This folder is the source of truth for reconstructing the RideTogether Supabase backend in a local stack or a new Supabase account.

## Contents

- `config.toml` - Supabase CLI local configuration.
- `migrations/` - schema, extensions, tables, constraints, indexes, triggers, RPCs, RLS, storage buckets/policies, and realtime publication setup.
- `seed.sql` - deterministic local/dev seed data that runs after migrations.

## Backend Objects Covered

- Extensions: `uuid-ossp`, `postgis`.
- Tables: `profiles`, `vehicles`, `rides`, `reservations`, `ratings`.
- Constraints: primary keys, foreign keys, status checks, positive/non-negative numeric checks, active reservation uniqueness.
- Indexes: foreign keys, ride search/sort paths, geospatial GiST indexes, reservation/rating lookup paths.
- Functions/RPCs: `handle_new_user`, `update_ride_locations`, `set_ride_geographies`, `prevent_self_reservation`, `search_rides_nearby`, `reserve_seat`, `cancel_reservation`.
- Triggers: auth profile bootstrap, ride geography hydration, self-reservation prevention.
- RLS: enabled on all public app tables with table-specific policies.
- Storage: `vehicles` and `avatars` public buckets with authenticated owner-folder write policies.
- Realtime: `rides` and `reservations` are added to the `supabase_realtime` publication when it exists.
- Auth provider config: local Google OAuth configuration is represented in `config.toml`; hosted dashboard secrets must be configured manually.

## Install The CLI

The repository scripts use `npx supabase`, so a global install is optional. To inspect the installed command shape before use:

```bash
npx supabase --help
npx supabase db --help
```

## Local Rebuild

Start the local Supabase stack:

```bash
npm run supabase:start
```

Reset the local database from migrations and seed data:

```bash
npm run supabase:reset
```

Check local service URLs and keys:

```bash
npm run supabase:status
```

Copy the local API URL and anon key into `.env` using the names from `.env.example`.

## Type Generation

After local migrations are running, regenerate app database types:

```bash
npm run supabase:types
```

This writes `src/types/supabase.ts`. Commit regenerated types whenever migrations change.

## Google Auth Setup

Google login uses Supabase Auth as the OAuth broker. The app opens the Supabase OAuth URL with Expo WebBrowser and returns through the custom scheme in `app.json`:

```txt
ridetogether://auth/callback
```

### Google Cloud

Create an OAuth client with type `Web application`.

Authorized JavaScript origins:

```txt
https://<project-ref>.supabase.co
http://localhost:8081
http://127.0.0.1:8081
```

Authorized redirect URIs:

```txt
https://<project-ref>.supabase.co/auth/v1/callback
http://127.0.0.1:54321/auth/v1/callback
```

For the current hosted project:

```txt
https://yliheyexcuufosggowmj.supabase.co/auth/v1/callback
```

The OAuth consent screen must be configured with the app name, support email, developer contact email, and authorized domain `supabase.co` or a custom auth domain if one is configured later.

### Supabase Dashboard

In `Authentication` -> `Sign In / Providers` -> `Google`:

- Enable Google.
- Paste the Google Web Client ID.
- Paste the Google Client Secret.
- Keep `Skip nonce checks` disabled for the Supabase OAuth flow used by this app.
- Keep `Allow users without an email` disabled unless a future provider cannot return email.

In `Authentication` -> `URL Configuration`:

- Site URL for local development: `http://localhost:8081`.
- Add redirect URLs:

```txt
ridetogether://auth/callback
exp://127.0.0.1:8081
exp://localhost:8081
http://localhost:8081
http://127.0.0.1:8081
```

For production, add the final app deep link/universal link before release.

### Local Supabase CLI

`config.toml` includes:

```toml
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_WEB_CLIENT_ID)"
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

Set those values in a local `.env` file. Do not commit real secrets.

If you later add separate Android/iOS Google OAuth client IDs, register them in Supabase provider settings as a comma-separated client ID list, with the Web client ID first.

## Remote Rebuild In A New Account

Create a new Supabase project, then link it:

```bash
npx supabase login
npx supabase link --project-ref <new-project-ref>
```

Apply migrations:

```bash
npm run supabase:push
```

Then set the mobile app environment variables from the new project settings:

```bash
EXPO_PUBLIC_SUPABASE_URL=<project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-or-publishable-key>
```

Do not commit real `.env` files or service-role keys.

## Seed Data

`seed.sql` depends on existing `auth.users`. On a fresh local reset, create a few users through the app or Studio Auth UI, then run:

```bash
npm run supabase:reset
```

The seed will populate profiles, vehicles, rides, one reservation, and one rating for available users. If no users exist, the seed intentionally inserts no app data.

## Edge Functions

No Supabase Edge Functions are currently used by the app. If functions are added later, place them under `supabase/functions/<function-name>` and document required secrets here without exposing secret values.

## Recovery Checklist

- Run `npm run supabase:reset` locally from a clean checkout.
- Regenerate `src/types/supabase.ts` with `npm run supabase:types`.
- Verify `profiles`, `vehicles`, `rides`, `reservations`, and `ratings` exist.
- Verify RLS is enabled on every public app table.
- Verify storage buckets `vehicles` and `avatars` exist and are public only by design.
- Verify Realtime is enabled for `rides` and `reservations` in the new project.
- Verify `search_rides_nearby`, `reserve_seat`, and `cancel_reservation` execute for expected roles.
- Verify Google provider settings and redirect URLs in the hosted Supabase dashboard.
- Update `.env` with the new project URL and anon/publishable key.
- Never place a service-role or secret key in the Expo client.

## Manual Verification Items

- Confirm hosted-project auth settings, email templates, redirect URLs, and OAuth providers in the Supabase dashboard.
- Confirm production storage file-size limits and public/private bucket decisions.
- Run Supabase security and performance advisors on the hosted project after migrations are applied.
- Review `security definer` RPC placement before production hardening; they are in `public` for current app compatibility and use explicit `search_path`.
