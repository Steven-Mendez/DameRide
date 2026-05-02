# Development

## Recommended Flow

1. Install dependencies.
2. Configure `.env`.
3. Start local Supabase or point to an existing Supabase project.
4. Start Expo.
5. Validate with lint and TypeScript before delivering changes.

## Commands

```bash
npm install
npm run start
npm run validate
```

## Expo Tunnel

LAN mode is faster, but a tunnel may be needed for physical device testing or when Google OAuth does not return correctly on the local network:

```bash
npx expo start --tunnel
```

## Local Supabase

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:status
npm run supabase:types
```

## Types

After migration changes, regenerate types with:

```bash
npm run supabase:types
```

