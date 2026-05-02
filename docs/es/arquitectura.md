# Arquitectura

DameRide está organizada como una app Expo Router con una capa de UI en `app/`, una capa compartida en `src/` y backend declarativo en `supabase/`.

## Capas Principales

| Capa | Ubicación | Responsabilidad |
| --- | --- | --- |
| Navegación y pantallas | `app/` | Rutas, tabs, auth, perfil, viaje y onboarding. |
| Componentes | `src/components/` | UI reutilizable, tarjetas, mapas, estados y controles. |
| Estado y hooks | `src/hooks/` | Sesión, perfil y subscripciones realtime. |
| Servicios | `src/lib/` | Supabase client, auth, database y storage. |
| Feature auth | `src/features/auth/` | Google sign-in, botón y hook OAuth. |
| Tipos | `src/types/` | Tipos del dominio y tipos generados de Supabase. |
| Backend | `supabase/` | Configuración local, migraciones y recuperación. |

## Flujo de Autenticación

`app/_layout.tsx` envuelve la app con `AuthProvider`. Según sesión y `profile.onboarding_completed_at`, redirige a login, onboarding o tabs.

`src/hooks/useAuth.tsx` escucha cambios de Supabase Auth y carga el perfil desde `profiles`.

## Flujo de Datos

Las pantallas usan funciones de `src/lib/database.ts` para leer o modificar perfiles, vehículos, viajes y reservas. Para archivos usan `src/lib/storage.ts`.

## Realtime

`src/hooks/useRealtime.ts` subscribe cambios Postgres para `rides` y `reservations`. Las migraciones agregan esas tablas a la publicación `supabase_realtime` cuando existe.

## Mapas y Rutas

Los componentes de mapa usan `react-native-maps` en nativo y variantes `.web.tsx` para web. `src/utils/maps.ts` calcula rutas con OSRM y fallback Valhalla, y guarda polyline, distancia y duración en `rides`.
