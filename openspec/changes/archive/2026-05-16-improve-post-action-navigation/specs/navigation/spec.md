# Spec Delta: Navigation — Forward Navigation After Create-Ride and Reserve-Seat

This delta adds two requirements to the `navigation` capability. It does not modify any existing `navigation` requirement (those govern the root navigator's mount/readiness and the auth/onboarding/tabs routing decision in `fix-onboarding-navigator-race`). It builds on the guarantee established there that the root navigator is always mounted, so the navigations specified below need no readiness guard. No `src/lib/database.ts` signature, `src/components/Button.tsx`, theme token, or `tailwind.config.js` change is part of this delta.

## ADDED Requirements

### Requirement: Creating a ride MUST navigate the user to the new ride's detail screen

After a successful ride creation in `app/(tabs)/publicar.tsx` `handlePublish()`, the app SHALL navigate the user forward to the newly created ride's detail screen `/ride/${data.id}` so the user lands on the detail of the thing they just did. The app MUST NOT remain on the Publicar tab as the defining post-success behavior.

`handlePublish()` MUST destructure `{ data, error }` from `createRide(...)` (it currently destructures `{ error }` only). `createRide` ends in `.select().single()` and returns the inserted row, so `data.id` is the new ride's id.

- On success WITH a usable id: the app SHALL `router.push(`/ride/${data.id}`)`. `router.push` (not `router.replace`) MUST be used so the tab back-stack is preserved and the user can navigate back from the detail into the Publicar tab.
- On success WITHOUT a usable id (`data?.id` is null/undefined despite no error): the app SHALL fall back to navigating to the home tab `/(tabs)/buscar`. The app MUST NOT push a malformed `/ride/undefined` (or `/ride/null`) route.

Navigation MUST occur after `setLoading(false)` and only in the non-error branch. The existing form reset (clearing origin/destination/points/date/time/seats/price/meeting point/notes and `setStep('route')`) is permitted to remain. The transient `success` state and its `setTimeout(... 4000)` are permitted to remain as harmless extra confirmation but are no longer the defining feedback — the navigation is the contract. The router is obtained via `useRouter` from `expo-router` (the file does not currently import it; adding that import is in scope).

The error path is unchanged: when `createRide` returns an `error`, the app SHALL show `Alert.alert('Error', error.message)` and MUST NOT navigate. The pre-submit validation guards (`'Completa la ruta'`, `'Ruta incompleta'`, `'Fecha y hora'`) and the login guard are unchanged and MUST NOT navigate.

#### Scenario: Successful creation lands on the new ride's detail

- **GIVEN** an authenticated user completes the publish form on the Publicar tab
- **WHEN** `createRide(...)` resolves with `{ data, error }` where `error` is null and `data.id` is a valid id
- **THEN** after `setLoading(false)` the app calls `router.push(`/ride/${data.id}`)`
- **AND** the user lands on the ride detail screen for the ride they just created
- **AND** the Publicar tab remains in the back-stack (the navigation was a `push`, not a `replace`)

#### Scenario: Successful creation with no usable id falls back home

- **GIVEN** an authenticated user submits the publish form
- **WHEN** `createRide(...)` resolves with `error` null but `data?.id` is null or undefined
- **THEN** the app navigates to the home tab `/(tabs)/buscar`
- **AND** the app does NOT push `/ride/undefined` or `/ride/null` or any malformed `/ride/` path

#### Scenario: Creation error shows the alert and does not navigate

- **GIVEN** an authenticated user submits the publish form
- **WHEN** `createRide(...)` resolves with a non-null `error`
- **THEN** the app shows `Alert.alert('Error', error.message)`
- **AND** the app does NOT navigate (the user remains on the Publicar tab)
- **AND** `setLoading(false)` has already run so no spinner is left stuck

#### Scenario: Validation guards still short-circuit without navigating

- **GIVEN** the user has not completed the route, points, or date/time
- **WHEN** the user attempts to advance/submit
- **THEN** the existing guard `Alert` fires (`'Completa la ruta'` / `'Ruta incompleta'` / `'Fecha y hora'`)
- **AND** `createRide` is not called and the app does NOT navigate

#### Scenario: Call site destructures the created row

- **GIVEN** the change has merged
- **WHEN** a developer reads `handlePublish()` in `app/(tabs)/publicar.tsx`
- **THEN** the `createRide(...)` result is destructured as `{ data, error }` (not `{ error }` only)
- **AND** `useRouter` is imported from `expo-router` in that file

### Requirement: Reserving a seat MUST navigate the user to their reservations list

After a successful seat reservation in `app/ride/[id].tsx` `handleReserve()`, the app SHALL navigate the user forward to their reservations tab `/(tabs)/reservas` — the screen for "what I just did." Because the user is already on the ride detail screen, the detail is NOT the forward surface here; the reservation lives in the reservations list. The app MUST NOT remain on the now-stale ride detail screen as the defining post-success behavior.

The reservation is performed inside the confirmation `Alert`'s "Reservar" `onPress` callback. On `reserveSeat(ride.id)` success (`error` is null), the app SHALL navigate to `/(tabs)/reservas`. The navigation MUST occur after `setReserving(false)` and only in the success branch. `/(tabs)/reservas` is the primary destination because `app/(tabs)/reservas.tsx` exists; `/(tabs)/buscar` is a fallback only if the reservations route is somehow unavailable.

The existing ride refetch (`getRideById(ride.id)` → `setRide`) and the transient `reserved` state with its `setTimeout(... 4000)` are permitted to remain if cheap, but they are no longer the defining behavior — leaving the stale detail confirmation is. The router is obtained via `useRouter` from `expo-router` (the file currently imports only `useLocalSearchParams` from `expo-router`; adding `useRouter` is in scope). No navigation-readiness guard is required: the root navigator is always mounted per the `fix-onboarding-navigator-race` requirements, and this navigation fires from a user-action `Alert` callback well after mount.

The error path is unchanged: when `reserveSeat` returns an `error`, the app SHALL show `Alert.alert('Error', error.message)` and MUST NOT navigate. The self-reserve guard MUST be unchanged: when `user.id === ride.driver_id`, the app shows `Alert.alert('Error', 'No puedes reservar tu propio viaje.')`, never calls `reserveSeat`, and does NOT navigate. The unauthenticated/no-ride early return (`if (!user || !ride) return;`) is unchanged.

#### Scenario: Successful reservation lands on the reservations tab

- **GIVEN** an authenticated user (not the ride's driver) is on a ride detail screen
- **WHEN** they tap "Reservar" on the confirmation `Alert` and `reserveSeat(ride.id)` resolves with `error` null
- **THEN** after `setReserving(false)` the app navigates to `/(tabs)/reservas`
- **AND** the user lands on their reservations list, not on the stale ride detail

#### Scenario: Reservation error shows the alert and does not navigate

- **GIVEN** an authenticated user taps "Reservar" on the confirmation `Alert`
- **WHEN** `reserveSeat(ride.id)` resolves with a non-null `error`
- **THEN** the app shows `Alert.alert('Error', error.message)`
- **AND** the app does NOT navigate (the user remains on the ride detail screen)
- **AND** `setReserving(false)` has already run so no spinner is left stuck

#### Scenario: Self-reserve guard is unchanged and does not navigate

- **GIVEN** the authenticated user IS the ride's driver (`user.id === ride.driver_id`)
- **WHEN** the user triggers `handleReserve()`
- **THEN** the app shows `Alert.alert('Error', 'No puedes reservar tu propio viaje.')`
- **AND** `reserveSeat` is not called
- **AND** the app does NOT navigate

#### Scenario: Cancelling the confirmation does nothing

- **GIVEN** the confirmation `Alert` is shown
- **WHEN** the user taps "Cancelar"
- **THEN** `reserveSeat` is not called and the app does NOT navigate

#### Scenario: Navigation is wired with the router import

- **GIVEN** the change has merged
- **WHEN** a developer reads `app/ride/[id].tsx`
- **THEN** `useRouter` is imported from `expo-router` alongside the existing `useLocalSearchParams` import
- **AND** the navigation call to `/(tabs)/reservas` sits inside the `reserveSeat` success branch, after `setReserving(false)`

## Acceptance

- After creating a ride end-to-end the app lands on `/ride/<new id>` (or `/(tabs)/buscar` only when there is no usable `data.id`).
- After reserving a seat end-to-end the app lands on `/(tabs)/reservas`.
- Both navigations occur strictly after their respective `setLoading(false)` / `setReserving(false)` and only in the success branch.
- Error paths, the self-reserve guard, login guards, and `publicar.tsx` validation guards behave exactly as before and never navigate.
- `git diff src/lib/database.ts` is empty.
- `npm run validate` exits 0.
