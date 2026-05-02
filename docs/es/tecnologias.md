# Tecnologías

## Stack Principal

| Tecnología | Uso en DameRide |
| --- | --- |
| Expo SDK 54 | Runtime y tooling de app móvil. |
| React Native 0.81 | UI móvil nativa. |
| React 19 | Modelo de componentes. |
| Expo Router 6 | Navegación basada en archivos. |
| TypeScript 5.9 | Tipado estático estricto. |
| NativeWind 4 | Estilos con clases tipo Tailwind. |
| Tailwind CSS 3 | Tema y tokens visuales. |
| Supabase JS 2 | Cliente de Auth, Database, Storage y Realtime. |
| Supabase CLI | Backend local, migraciones y tipos. |
| Postgres/PostGIS | Datos relacionales y búsqueda geoespacial. |
| react-native-maps | Mapas en pantallas nativas. |
| expo-image-picker | Avatar y fotos de vehículos. |
| expo-auth-session / expo-web-browser | OAuth con Google vía Supabase. |

## UI y Experiencia

- `lucide-react-native` para iconografía.
- `@expo-google-fonts/plus-jakarta-sans` para tipografía.
- `@react-native-community/datetimepicker` para selección de fecha y hora.
- `react-native-safe-area-context` para layout seguro.

## Servicios Externos de Rutas

`src/utils/maps.ts` consulta endpoints públicos de OSRM y Valhalla para rutas de conducción.
