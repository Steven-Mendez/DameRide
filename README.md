# RideTogether

RideTogether is an Expo Router / React Native app backed by Supabase. The app supports driver profiles, vehicles, ride search, reservations, storage-backed images, geospatial nearby search, and realtime ride/reservation updates.

## Stack

- Expo SDK 54, React Native 0.81, React 19, Expo Router.
- TypeScript with strict mode.
- NativeWind for styling.
- Supabase Auth, Postgres, PostGIS, Storage, Realtime, and RPC functions.

## Environment

Create `.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=ridetogether
EXPO_PUBLIC_AUTH_REDIRECT_URL=ridetogether://auth/callback
```

Only use a Supabase anon or publishable key in the Expo client. Never use a service-role or secret key in mobile code.

For local Google OAuth through Supabase CLI, also set these non-public provider values in `.env`:

```bash
GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

Do not expose the Google client secret in the Expo client.

## Setup

Install dependencies:

```bash
npm install
```

Start local Supabase, rebuild the database, and copy local values into `.env`:

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:status
```

Start the app:

```bash
npm run start
```

## Validation

```bash
npm run lint
npm run typecheck
npm run validate
```

Use `npm run export` for an Expo export smoke test when needed.

## Supabase Workflows

```bash
npm run supabase:start
npm run supabase:status
npm run supabase:reset
npm run supabase:types
npm run supabase:push
```

See `supabase/README.md` for full backend recovery and new-account rebuild instructions.

## Google Login

Google login uses Supabase Auth OAuth with the Expo scheme `ridetogether`. The mobile redirect URL is:

```txt
ridetogether://auth/callback
```

The Google Cloud OAuth client must include this Supabase callback as an authorized redirect URI:

```txt
https://<project-ref>.supabase.co/auth/v1/callback
```

For this project, the hosted callback is:

```txt
https://yliheyexcuufosggowmj.supabase.co/auth/v1/callback
```

## Architecture

- `app/` contains Expo Router screens and route groups.
- `src/lib/supabase.ts` owns lazy Supabase client initialization for Expo Router compatibility.
- `src/lib/database.ts` contains repository-style Supabase data operations used by UI/hooks.
- `src/lib/storage.ts` contains storage upload helpers for avatars and vehicle photos.
- `src/hooks/useAuth.tsx` manages auth/session/profile state.
- `src/hooks/useRealtime.ts` manages Postgres Realtime subscriptions.
- `src/types/supabase.ts` is generated from Supabase migrations and used to type the client.
- `src/types/database.ts` contains app-facing domain types used by components.

## Backend Recovery

The `/supabase` folder is intended to reconstruct the backend from scratch. It includes CLI config, migrations, storage policy setup, realtime publication setup, seed data, and recovery documentation.
