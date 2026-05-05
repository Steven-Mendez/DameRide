# DameRide

DameRide is a mobile app built with Expo, React Native, and Supabase for finding, publishing, and reserving shared rides. The project includes authentication, onboarding, profiles, vehicles, maps, geospatial search, reservations, image storage, and realtime updates.

Spanish version: [README.es.md](README.es.md)

## Videos

Promotional video:
https://github.com/Steven-Mendez/DameRide/releases/download/media-assets-v1/dameride-promotional-video.mp4

Real usage video:
https://github.com/Steven-Mendez/DameRide/releases/download/media-assets-v1/dameride-real-usage.mp4

Screenshots are available in: [`docs/media/screenshots`](docs/media/screenshots)

## Technologies

| Area | Technology |
| --- | --- |
| Mobile app | Expo SDK 54, React Native 0.81, React 19 |
| Navigation | Expo Router |
| Language | Strict TypeScript |
| UI | NativeWind, Tailwind CSS, Plus Jakarta Sans, lucide-react-native |
| Backend | Supabase Auth, Postgres, PostGIS, Storage, Realtime |
| Maps/routes | react-native-maps, public OSRM and Valhalla endpoints |
| Validation | Expo ESLint, TypeScript |

## Main Features

- Email and password registration/login.
- Google sign-in through Supabase OAuth.
- Onboarding flow to complete the profile and optionally register a vehicle.
- Ride search by route, date, time, radius, and sorting option.
- Ride publishing with map, seats, price, and notes.
- Seat reservation and cancellation.
- Profile, WhatsApp contact, and vehicle management.
- Avatar and vehicle photo uploads to Supabase Storage.
- Realtime updates for rides and reservations.

## Requirements

- Node.js and npm.
- Expo through `npx expo`.
- Supabase CLI through `npx supabase` if using the local backend.
- Expo Go, an emulator/simulator, or a development build.
- A configured Supabase project or an active local stack.

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the required values.

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback

GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

Never commit real secrets or include them in documentation. The mobile app must only use public anon/publishable keys. Do not use `SUPABASE_SERVICE_ROLE_KEY` in React Native.

## Development

```bash
npm run start
```

If you need a tunnel for a physical device or OAuth on restrictive networks:

```bash
npx expo start --tunnel
```

Only clear the Metro cache when needed:

```bash
npx expo start --tunnel --clear
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run start` | Starts Expo. |
| `npm run android` | Starts Expo and opens Android. |
| `npm run ios` | Starts Expo and opens iOS. |
| `npm run web` | Starts Expo for web. |
| `npm run lint` | Runs ESLint with the Expo config. |
| `npm run typecheck` | Runs TypeScript without emitting files. |
| `npm run validate` | Runs lint and typecheck. |
| `npm run export` | Generates an Expo export. |
| `npm run supabase:start` | Starts local Supabase. |
| `npm run supabase:stop` | Stops local Supabase. |
| `npm run supabase:status` | Shows local URLs and keys. |
| `npm run supabase:reset` | Rebuilds the local database from migrations. |
| `npm run supabase:push` | Applies migrations to a linked remote project. |
| `npm run supabase:types` | Generates TypeScript types from local Supabase. |

## Project Structure

```txt
app/                 Screens and navigation with Expo Router
src/components/      Reusable UI and map components
src/features/auth/   Google sign-in flow
src/hooks/           Authentication and realtime hooks
src/lib/             Supabase client, auth, database, and storage
src/types/           Domain types and generated Supabase types
src/utils/           Formatting, avatar, maps, and route utilities
supabase/            Local config, migrations, and backend documentation
docs/es/             Spanish project documentation
docs/eng/            English project documentation
```

## Documentation

Read the full English documentation in [`docs/eng/index.md`](docs/eng/index.md).

- [Introduction](docs/eng/introduction.md)
- [Installation](docs/eng/installation.md)
- [Configuration](docs/eng/configuration.md)
- [Architecture](docs/eng/architecture.md)
- [Supabase](docs/eng/supabase.md)
- [Database](docs/eng/database.md)
- [Authentication](docs/eng/authentication.md)
- [Portfolio](docs/eng/portfolio.md)

Spanish documentation is available in [`docs/es/indice.md`](docs/es/indice.md).

## Authorship and Credits

- Full application development: Steven Mendez.
- Business idea, conceptual design, main flows, and functional guidance: Br. Vilma Paiz.
- Project developed to support Br. Vilma Paiz in her Entrepreneurship class at UAM Managua.
- Project developed as a professional portfolio piece.

## License

This project is open source under the MIT license. See [`LICENSE`](LICENSE) for details.
