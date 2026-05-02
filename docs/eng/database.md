# Database

The database uses PostgreSQL with PostGIS. The model is defined in `supabase/migrations/`.

## Tables

| Table | Purpose |
| --- | --- |
| `profiles` | Public user profile, city, phone, avatar, rating, completed rides, and onboarding. |
| `vehicles` | User vehicles with make, model, color, plate, seats, and photo. |
| `rides` | Published rides, route, coordinates, polyline, seats, price, and status. |
| `reservations` | Passenger reservations per ride. |
| `ratings` | User ratings associated with rides. |

## Functions and RPCs

| Function | Use |
| --- | --- |
| `handle_new_user` | Creates a profile when a user signs up. |
| `update_ride_locations` | Hydrates geography columns from lat/lng. |
| `set_ride_geographies` | Historical/compatibility geography function. |
| `prevent_self_reservation` | Prevents drivers from reserving their own rides. |
| `search_rides_nearby` | Searches active nearby rides using PostGIS. |
| `reserve_seat` | Creates a confirmed reservation and decreases available seats. |
| `cancel_reservation` | Cancels a reservation and restores seats. |

## Triggers

- `on_auth_user_created` on `auth.users`.
- `trg_update_ride_locations` on `public.rides`.
- `trg_prevent_self_reservation` on `public.reservations`.

## Constraints and Indexes

Migrations add constraints for valid statuses, positive/non-negative ranges, and uniqueness of active reservations per passenger/ride. They also include indexes for driver, vehicle, status, date, price, seats, reservations, and geospatial searches.

## Realtime

The `rides` and `reservations` tables are configured with replica identity full and added to `supabase_realtime` when the publication exists.

## Runtime Data

Users, sessions, Storage objects, real rides, and real reservations are not part of migrations. They must be created through the app or restored from separate backups.
