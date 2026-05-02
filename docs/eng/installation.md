# Installation

## Requirements

- Node.js and npm installed.
- Access to `npx expo` to start the app.
- Access to `npx supabase` if using local Supabase.
- Expo Go, an emulator/simulator, or a development build.
- A `.env` file configured from `.env.example`.

## Install Dependencies

```bash
npm install
```

## Configure Variables

Create `.env` using `.env.example` as the base:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback

GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

Do not commit real secrets or include them in documentation.

## Optional Local Backend

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:status
```

Then copy the local URL and anon key into `.env`.

## Start the App

```bash
npm run start
```

If you need to test on a physical device with a restrictive network or fix OAuth redirect issues:

```bash
npx expo start --tunnel
```

Use `--clear` only when Metro cache causes unusual issues:

```bash
npx expo start --tunnel --clear
```
