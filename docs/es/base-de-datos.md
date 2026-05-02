# Base de Datos

La base de datos usa PostgreSQL con PostGIS. El modelo está definido en `supabase/migrations/`.

## Tablas

| Tabla | Propósito |
| --- | --- |
| `profiles` | Perfil público del usuario, ciudad, teléfono, avatar, rating, viajes completados y onboarding. |
| `vehicles` | Vehículos del usuario con marca, modelo, color, placa, asientos y foto. |
| `rides` | Viajes publicados, ruta, coordenadas, polyline, cupos, precio y estado. |
| `reservations` | Reservas de pasajeros por viaje. |
| `ratings` | Calificaciones entre usuarios asociadas a viajes. |

## Funciones y RPCs

| Función | Uso |
| --- | --- |
| `handle_new_user` | Crea perfil al registrar usuario. |
| `update_ride_locations` | Hidrata columnas geography desde lat/lng. |
| `set_ride_geographies` | Función histórica/compatibilidad para geography. |
| `prevent_self_reservation` | Evita que un conductor reserve su propio viaje. |
| `search_rides_nearby` | Busca viajes activos cercanos usando PostGIS. |
| `reserve_seat` | Crea reserva confirmada y descuenta cupos. |
| `cancel_reservation` | Cancela reserva y restaura cupos. |

## Triggers

- `on_auth_user_created` en `auth.users`.
- `trg_update_ride_locations` en `public.rides`.
- `trg_prevent_self_reservation` en `public.reservations`.

## Constraints e Índices

Las migraciones agregan constraints para estados válidos, rangos positivos/no negativos y unicidad de reservas activas por pasajero/viaje. También incluyen índices para consultas por conductor, vehículo, estado, fecha, precio, cupos, reservas y búsquedas geoespaciales.

## Realtime

Las tablas `rides` y `reservations` se configuran con replica identity full y se agregan a `supabase_realtime` cuando la publicación existe.

## Datos Runtime

Usuarios, sesiones, objetos de Storage, viajes reales y reservas reales no forman parte de las migraciones. Deben crearse por la app o restaurarse desde backups separados.
