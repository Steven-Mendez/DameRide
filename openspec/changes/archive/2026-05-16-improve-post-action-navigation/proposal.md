# Improve Post-Action Navigation

## Why

Two of the app's highest-intent actions — creating a ride and reserving a seat — currently end with the user stranded on the screen they acted from, watching a transient banner fade out. There is no forward motion to "the thing I just did." The user reported this verbatim: after reserving a seat or creating a trip, the app should *navigate* the user to what they just did (the detail of the thing, or home) instead of just sitting on a confirmation toast — "If it's too hard, send me home."

Separately, the search-submit button on the Buscar tab is rendered with the muted `primary-container` treatment, so it reads as a *disabled* button next to the app's real solid-orange primary CTAs (login buttons, the just-fixed `<RideCard>` CTA). The user reported: "the 'buscar viajes' button is pale orange, unlike the other (solid) buttons." Its icon is also hard-coded white, which is nearly invisible on the pale peach fill — so the button currently looks both disabled and icon-less.

These are perceived-flow and perceived-affordance defects. The actions all work; they just don't move the user forward or look tappable.

## Current Behavior

Already investigated — encoded here, not to be re-investigated.

1. **Create trip — `app/(tabs)/publicar.tsx` `handlePublish()` (lines ~91–112).** On success it does `setSuccess(true)`, resets every form field, `setStep('route')`, and `setTimeout(() => setSuccess(false), 4000)`. The user stays on the Publicar tab watching a 4-second banner; there is no navigation. The call currently destructures only `{ error }` from `createRide(...)`. `createRide(...)` in `src/lib/database.ts` (line ~314) ends in `.select().single()` and returns `{ data, error }`, so the inserted row — including `data.id` — is already available; it is just discarded.

2. **Reserve seat — `app/ride/[id].tsx` `handleReserve()` (lines ~45–69).** A confirmation `Alert` → on "Reservar" → `reserveSeat(ride.id)` (returns `{ data, error }`). On success it sets `setReserved(true)`, refetches the ride via `getRideById`, and `setTimeout(() => setReserved(false), 4000)`. The user stays on the now-stale ride detail screen. The meaningful "what I just did" surface is the user's reservations list, which they never reach.

3. **Pale search button — `app/(tabs)/buscar.tsx` (lines ~353–359).** `<Button title={pickupPoint && destinationPoint ? 'Ver viajes' : 'Ver todos los viajes'} onPress={handleSearch} loading={loading} icon={<Search size={20} color="#ffffff" />} variant="primary-container" />`. `variant="primary-container"` resolves to `bg-primary-container` (`#FFD7BF`, pale peach) + `text-on-primary-container`. The icon is hard-coded `#ffffff`, nearly invisible on that pale fill. Every other real primary CTA in the app uses `variant="primary"` (solid `#FF6B1A`, white text/icon).

## Approach

Make each successful action push the user forward to the screen for what they just did, and fix the search button to the solid primary treatment.

- **A. After creating a ride → ride detail.** Destructure `{ data, error }` from `createRide`. On success, navigate to the new ride's detail screen `/ride/${data.id}` — this is literally "ver los detalles de lo que acabo de hacer." If `data?.id` is missing or null for any reason, fall back to home: the `/(tabs)/buscar` tab. The user explicitly accepted "home" as the fallback. Navigation is a `router.push` (not `replace`) so the tab back-stack is preserved and the user can swipe/back out of the detail into the Publicar tab. The form reset stays. The transient `success` banner is no longer the defining feedback — it may remain as harmless extra confirmation, but the navigation is the contract.

  **The create→detail vs. home decision.** Detail is preferred because it is the most specific, most useful "what I just did" surface: the driver immediately sees their published ride exactly as a rider will, can sanity-check it, and can share it. Home (`/(tabs)/buscar`) is the fallback *only* when there is no `data.id` to route to (e.g. an unexpected null row despite no error). We do not make home the primary destination "because it's simpler" — the user asked for the detail of the thing they did, and `createRide`'s `.select().single()` already returns the id, so the detail route is cheap. Home-as-fallback honors the user's explicit "if it's too hard, send me home" only in the genuinely-degenerate no-id case.

- **B. After reserving a seat → reservations list.** On `reserveSeat` success, navigate to the user's reservations tab `/(tabs)/reservas` — that is "what I just did" (the user is already on the ride detail, so the detail is *not* the forward surface here; the reservation lives in the reservations list). `app/(tabs)/reservas.tsx` exists, so this is the primary path; `/(tabs)/buscar` is a fallback only if the reservations route is somehow unavailable. The existing cheap ride refetch may stay, but it is no longer the point — the point is leaving the now-stale detail confirmation. The reserve happens inside the `Alert` "Reservar" `onPress` callback; navigation must occur in the success branch, after `setReserving(false)`. The root navigator is always mounted (post the `fix-onboarding-navigator-race` change), so no navigation-readiness guard is required here.

- **C. Search button consistency.** In `app/(tabs)/buscar.tsx`, change the search-submit `<Button>`'s `variant="primary-container"` → `variant="primary"`. No other prop changes — the icon stays `color="#ffffff"`, which is now correct (white on the solid `#FF6B1A` fill). This makes the button match the login primary buttons and the `<RideCard>` CTA.

## Scope

In scope:

- `app/(tabs)/publicar.tsx` — destructure `{ data, error }` from `createRide`; on success navigate to `/ride/${data.id}` (fallback `/(tabs)/buscar` when no `data?.id`). Add `useRouter` from `expo-router` (the file does not currently import it).
- `app/ride/[id].tsx` — on `reserveSeat` success, navigate to `/(tabs)/reservas` (fallback `/(tabs)/buscar`). Add `useRouter` from `expo-router` (the file currently imports only `useLocalSearchParams` from `expo-router`).
- `app/(tabs)/buscar.tsx` — the single `variant` prop swap on the search-submit `<Button>`.
- `npm run validate` (runs `npm run lint && npm run typecheck`).
- Manual QA: create a ride end-to-end; reserve a seat end-to-end; visually confirm the search button.

## Non-Goals

- **No `src/lib/database.ts` signature changes.** `createRide` and `reserveSeat` already return `{ data, error }`; only the call sites' destructuring/handling changes.
- **No changes to `src/components/Button.tsx`, `src/constants/theme.ts`, or `tailwind.config.js`.** `primary` is an existing `<Button>` variant and an existing token; this is a prop-value swap, not a token or component change.
- **No new banner/toast/copy work.** The existing `success` / `reserved` transient states and any Spanish copy are not redesigned. They may remain as harmless extra confirmation; the requirement is the navigation, not the banner.
- **No error-path behavior change.** Error branches still show the existing `Alert.alert('Error', error.message)` and MUST NOT navigate. The self-reserve guard (`'No puedes reservar tu propio viaje.'`), login guards, and route/validation guards in `publicar.tsx` (`'Completa la ruta'`, `'Ruta incompleta'`, `'Fecha y hora'`) are unchanged.
- **`app/index.tsx` is intentionally NOT changed.** Its `bg-primary-container` / `bg-secondary-container` CTAs would exhibit the same "looks disabled" issue, but `app/index.tsx` is an obscured placeholder behind the brand splash (per the shipped `fix-onboarding-navigator-race` change) and is not user-visible in the normal flow. It is logged as out-of-scope-but-known so a reviewer does not treat it as an oversight.
- **No navigation-readiness guard.** The root navigator is always mounted post `fix-onboarding-navigator-race`; these navigations fire from user-action callbacks, well after mount. No `useRootNavigationState` guard is added.

## Risks and Mitigations

- **Risk: navigating before `setLoading(false)` / `setReserving(false)` leaves a stuck spinner on the screen being left.** Mitigation: the spec requires navigation to occur strictly *after* `setLoading(false)` (publicar) and *after* `setReserving(false)` (ride detail), inside the success branch only.
- **Risk: `createRide` returns no row but also no error, so `data?.id` is undefined and `/ride/undefined` is pushed.** Mitigation: the requirement mandates an explicit `data?.id` presence check; absent an id, navigate to the `/(tabs)/buscar` home fallback, never to a malformed `/ride/` path.
- **Risk: using `router.replace` from a tab would discard the tab back-stack and trap the user in detail.** Mitigation: the spec mandates `router.push` for the create→detail navigation specifically to preserve the tab back-stack.
- **Risk: a reviewer thinks `app/index.tsx` was missed.** Mitigation: an explicit NOTE in the branding delta records it as knowingly out of scope.
- **Risk: error paths regress into navigating.** Mitigation: scenarios assert that error branches show the existing Alert and dispatch no navigation.

## Acceptance Criteria

1. After creating a ride end-to-end on the Publicar tab, the app lands on that ride's detail screen at route `/ride/<the new ride id>`. When (and only when) `createRide` returns success but no usable `data.id`, the app lands on the `/(tabs)/buscar` home tab instead.
2. `app/(tabs)/publicar.tsx` `handlePublish()` destructures `{ data, error }` from `createRide(...)` (no longer `{ error }` only). Navigation occurs after `setLoading(false)` and only in the non-error branch.
3. After reserving a seat end-to-end from a ride detail screen, the app lands on the `/(tabs)/reservas` tab. Navigation occurs after `setReserving(false)` and only in the `reserveSeat` success branch, inside the `Alert` "Reservar" `onPress` callback.
4. The search-submit `<Button>` in `app/(tabs)/buscar.tsx` uses `variant="primary"`; the substring `variant="primary-container"` no longer appears on that button. Its `title`, `onPress={handleSearch}`, `loading={loading}`, and `icon={<Search size={20} color="#ffffff" />}` props are unchanged.
5. The search button renders a solid `#FF6B1A` fill with a clearly visible white label and white search icon, visually indistinguishable in activeness/prominence from the login screen's "Iniciar sesion" / "Crear cuenta" buttons.
6. No regression on error paths: a failing `createRide` still shows `Alert.alert('Error', error.message)` and does not navigate; a failing `reserveSeat` still shows `Alert.alert('Error', error.message)` and does not navigate. The self-reserve guard, login guards, and `publicar.tsx` route/date validation guards behave exactly as before and do not navigate.
7. `git diff src/lib/database.ts src/components/Button.tsx src/constants/theme.ts tailwind.config.js` is empty.
8. `git diff --name-only` shows only `app/(tabs)/publicar.tsx`, `app/ride/[id].tsx`, and `app/(tabs)/buscar.tsx` as production files changed by this change.
9. `npm run validate` exits 0 (lint and typecheck pass with no new errors).

## Open Questions

None blocking.
