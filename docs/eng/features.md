# Features

## Authentication

- Email, password, and profile metadata registration.
- Email and password login.
- Google login through Supabase OAuth.
- Native session persistence with AsyncStorage.
- Automatic redirects based on session and onboarding state.

## Onboarding

The onboarding flow collects name, phone number, department, and optionally an initial vehicle. When completed, it updates `profiles.onboarding_completed_at`.

## Ride Search

The `buscar` screen allows users to select pickup/dropoff points on a map, filter by date, time, and radius, sort by nearest pickup, soonest, lowest price, or most seats, view results in list/map modes, and receive realtime updates.

## Ride Publishing

The `publicar` screen allows users to define route, exact points, date, time, seats, price, meeting point, and notes. If a vehicle exists, the first user vehicle is associated with the ride.

## Reservations

Users can reserve a seat from the ride detail screen. The reservation is handled by the `reserve_seat` RPC, which validates availability and prevents users from reserving their own rides. The `reservas` screen shows active reservations and published rides, and allows cancellation through `cancel_reservation`.

## Profile and Vehicles

The profile screen shows user data, rating, completed ride count, vehicle count, and WhatsApp contact. Additional screens support profile editing, avatar upload, vehicle creation/editing, and vehicle photo upload.

## Maps and Routes

The app uses visual point selection and route calculation through OSRM/Valhalla. It stores polyline, distance, and duration when available.
