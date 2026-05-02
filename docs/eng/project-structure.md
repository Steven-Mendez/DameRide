# Project Structure

```txt
DameRide/
├── app/
├── assets/
├── docs/eng/
├── docs/es/
├── scripts/
├── src/
├── supabase/
├── app.json
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## `app/`

| Route | Purpose |
| --- | --- |
| `app/_layout.tsx` | Root layout, fonts, splash, and auth/onboarding redirects. |
| `app/index.tsx` | Initial screen/redirect based on session. |
| `app/onboarding.tsx` | Complete profile and optionally register a vehicle. |
| `app/(auth)/login.tsx` | Login with Google and email. |
| `app/(auth)/register.tsx` | Email registration. |
| `app/(tabs)/buscar.tsx` | Ride search. |
| `app/(tabs)/publicar.tsx` | Ride publishing. |
| `app/(tabs)/reservas.tsx` | Reservations and published rides. |
| `app/(tabs)/perfil.tsx` | Profile, contact, and account actions. |
| `app/ride/[id].tsx` | Ride details and reservation. |
| `app/profile/edit.tsx` | Profile and avatar editing. |
| `app/profile/vehicle.tsx` | Create/edit vehicle and photo. |

## `src/`

| Folder | Purpose |
| --- | --- |
| `src/components/` | Reusable visual components. |
| `src/constants/` | Visual theme and popular Nicaraguan routes. |
| `src/features/auth/` | Google OAuth. |
| `src/hooks/` | AuthProvider and Realtime hooks. |
| `src/lib/` | Supabase client, auth, queries, and storage. |
| `src/types/` | Domain types and generated types. |
| `src/utils/` | Formatting, avatar, and route calculation. |

## `supabase/`

Contains `config.toml`, SQL migrations, and backend recovery documentation. Seeds were removed; a clean rebuild creates structure, not test data.
