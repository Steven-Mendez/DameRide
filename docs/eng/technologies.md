# Technologies

## Main Stack

| Technology | Use in DameRide |
| --- | --- |
| Expo SDK 54 | Mobile runtime and tooling. |
| React Native 0.81 | Native mobile UI. |
| React 19 | Component model. |
| Expo Router 6 | File-based navigation. |
| TypeScript 5.9 | Strict static typing. |
| NativeWind 4 | Tailwind-like styling classes. |
| Tailwind CSS 3 | Theme and visual tokens. |
| Supabase JS 2 | Auth, Database, Storage, and Realtime client. |
| Supabase CLI | Local backend, migrations, and types. |
| Postgres/PostGIS | Relational data and geospatial search. |
| react-native-maps | Native map screens. |
| expo-image-picker | Avatar and vehicle photos. |
| expo-auth-session / expo-web-browser | Google OAuth through Supabase. |

## UI and Experience

- `lucide-react-native` for icons.
- `@expo-google-fonts/plus-jakarta-sans` for typography.
- `@react-native-community/datetimepicker` for date and time selection.
- `react-native-safe-area-context` for safe layouts.

## External Routing Services

`src/utils/maps.ts` calls public OSRM and Valhalla endpoints for driving routes.
