# Tasks: Improve Post-Action Navigation

## Phase 1 — After creating a ride: navigate to the new ride detail

- [x] 1.1 In `app/(tabs)/publicar.tsx`, add `import { useRouter } from 'expo-router';` and obtain `const router = useRouter();` in the component (the file does not currently import the router).
- [x] 1.2 In `handlePublish()`, change the `createRide(...)` call to destructure `{ data, error }` instead of `{ error }` only.
- [x] 1.3 Keep the error branch exactly as-is: `if (error) { Alert.alert('Error', error.message); }` — no navigation.
- [x] 1.4 In the success branch, after `setLoading(false)` and the existing form reset / `setStep('route')`: if `data?.id` is present, call `router.push(`/ride/${data.id}`)`; otherwise call `router.push('/(tabs)/buscar')` (home fallback). Never push a malformed `/ride/` path.
- [x] 1.5 Confirm navigation happens only in the non-error branch and strictly after `setLoading(false)`. The transient `success` state / `setTimeout` may stay untouched.

## Phase 2 — After reserving a seat: navigate to the reservations list

- [x] 2.1 In `app/ride/[id].tsx`, add `useRouter` to the existing `expo-router` import (currently `import { useLocalSearchParams } from 'expo-router';`) and obtain `const router = useRouter();` in the component.
- [x] 2.2 In the `Alert` "Reservar" `onPress` callback, keep the `reserveSeat(ride.id)` error branch exactly as-is: `Alert.alert('Error', error.message)` — no navigation.
- [x] 2.3 In the `reserveSeat` success branch, after `setReserving(false)` (and after the existing optional `getRideById` refetch / `reserved` state, which may remain): call `router.push('/(tabs)/reservas')`.
- [x] 2.4 Confirm the self-reserve guard (`'No puedes reservar tu propio viaje.'`), the `if (!user || !ride) return;` early return, and the "Cancelar" path are unchanged and never navigate.

## Phase 3 — Search button consistency

- [x] 3.1 In `app/(tabs)/buscar.tsx`, on the search-submit `<Button>` (title `'Ver viajes'` / `'Ver todos los viajes'`, `onPress={handleSearch}`), change `variant="primary-container"` to `variant="primary"`.
- [x] 3.2 Confirm no other prop on that button changed — `title`, `onPress`, `loading`, and `icon={<Search size={20} color="#ffffff" />}` are byte-identical to before.
- [x] 3.3 Do NOT touch `app/index.tsx` (intentionally out of scope; obscured placeholder behind the splash).

## Phase 4 — Validate

- [x] 4.1 Run `npm run validate` (`npm run lint && npm run typecheck`) and confirm it exits 0 with no new errors.
- [x] 4.2 Run `git diff src/lib/database.ts src/components/Button.tsx src/constants/theme.ts tailwind.config.js` and confirm it is empty.
- [x] 4.3 Run `git diff --name-only` and confirm only `app/(tabs)/publicar.tsx`, `app/ride/[id].tsx`, and `app/(tabs)/buscar.tsx` are changed production files.

## Phase 5 — Manual QA

- [ ] 5.1 DEFERRED (requires simulator/device; cannot run in headless agent env) — Create a ride end-to-end on the Publicar tab; confirm the app lands on that ride's detail screen (`/ride/<new id>`), the detail shows the data just entered, and back returns to the Publicar tab. Static reasoning: `data?.id` present → `router.push(`/ride/${data.id}`)` (push preserves Publicar in back-stack).
- [ ] 5.2 DEFERRED (requires runtime observation) — No-id fallback path: code path `else { router.push('/(tabs)/buscar') }` is only reachable when `data?.id` is falsy; `/ride/undefined` is never pushed (guarded by the `data?.id` check).
- [ ] 5.3 DEFERRED (requires simulator/device) — From a ride detail screen (as a non-driver), reserve a seat end-to-end; confirm the app lands on `/(tabs)/reservas` with the new reservation visible. Static reasoning: `router.push('/(tabs)/reservas')` is in the `reserveSeat` success branch after `setReserving(false)`.
- [ ] 5.4 DEFERRED (requires simulator/device) — Self-reserve + `reserveSeat` error cases. Static reasoning: self-reserve guard returns before the `Alert`; error branch only calls `Alert.alert('Error', error.message)` with no `router` call.
- [ ] 5.5 DEFERRED (requires visual inspection on device) — Search button solid `#FF6B1A` with visible white label/icon. Static reasoning: `variant="primary"` resolves to `bg-primary`/`text-on-primary` per `src/components/Button.tsx`; icon stays `color="#ffffff"`.
