# Troubleshooting

## Google Login Does Not Return to the App

Check the redirect printed by `src/features/auth/services/googleAuth.ts`:

```txt
Google auth redirect URL: ...
```

That redirect must be allowed in the Supabase Dashboard. If you are using Expo Go and LAN fails, try:

```bash
npx expo start --tunnel
```

## Changes Do Not Appear

Clear Metro cache only when needed:

```bash
npx expo start --clear
```

Or with tunnel:

```bash
npx expo start --tunnel --clear
```

## Supabase Is Not Configured

If configuration errors appear, check `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Storage Fails to Upload Images

Check that buckets `avatars` and `vehicles` exist, accept the image MIME type, and have policies allowing writes inside the authenticated user's folder.

## Nearby Rides Do Not Appear

Check that rides have `origin_lat`, `origin_lng`, `destination_lat`, and `destination_lng`. Geography columns are hydrated by trigger and nearby search uses `search_rides_nearby`.

## Supabase Types Are Outdated

```bash
npm run supabase:types
```

## Pushing to an Existing Remote Project

Do not apply migrations to the current hosted project without reconciling history. `supabase/README.md` documents that the hosted project has its own migration history.
