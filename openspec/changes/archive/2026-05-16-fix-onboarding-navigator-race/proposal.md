# Fix Onboarding Navigator Race

## Why

In development, navigating after login produces a runtime error:

```
The action 'REPLACE' with payload {"name":"onboarding","params":{}} was not handled by any navigator. Do you have a route named 'onboarding'?
```

The route is **not** missing. `app/onboarding.tsx` exists and `<Stack.Screen name="onboarding" />` is declared in `app/_layout.tsx` (line 78). The error is a race between an imperative `router.replace` and the root navigator's mount/readiness lifecycle.

Root cause (already diagnosed — encoded here, not re-investigated):

1. **The navigator is withheld while auth/profile loads.** `RootLayoutNav()` in `app/_layout.tsx` returns `<BrandSplash />` early (lines 70–72) *before* rendering `<Stack>` whenever `loading || profileLoading`. After login, `useAuth` flips `profileLoading` true→false as it refetches the profile on the `user` change, which unmounts and then remounts the `<Stack>` subtree. The redirect `useEffect` in the same component (lines 49–68) calls `router.replace('/onboarding')` in the same render cycle in which the `<Stack>` first (re)mounts — before expo-router's root navigation state is ready. With no mounted navigator able to handle the action, React Navigation throws "not handled by any navigator."

2. **Duplicated, competing redirect logic.** `app/index.tsx` *also* runs a `useEffect` (lines 15–28) that independently dispatches `router.replace('/onboarding')` / `'/(tabs)/buscar'` / `'/(auth)/login'`, racing the equivalent logic in `app/_layout.tsx` (lines 49–68). Two effects in two components dispatch REPLACE for the same transition, compounding the race and making the navigation decision non-deterministic.

The route registration is correct; the lifecycle and the duplication are the bug.

## What Changes

- **`app/_layout.tsx` — never withhold the navigator.** The root `<Stack>` MUST always be rendered. The brand splash MUST be shown without unmounting the navigator (e.g. `<BrandSplash />` rendered as an overlay layered on top of an always-mounted `<Stack>`, or by gating only the redirect side-effect — not the navigator tree). This guarantees a mounted navigator exists whenever any `router.replace` is dispatched. The early `return <BrandSplash />;` (lines 70–72) is removed; the splash moves into the always-rendered tree.

- **`app/_layout.tsx` — guard imperative redirects on navigation readiness.** The redirect effect MUST NOT dispatch any `router.replace` until the root navigation is ready, using the expo-router-recommended readiness signal. The implementer MUST confirm the current idiomatic API against the expo-router 6 docs via context7 (`/expo/router` or the Expo docs site) before implementing — the expected approach is `useRootNavigationState()` and only navigating once its `?.key` is defined, but the exact hook/field must be verified for SDK 54 / expo-router 6.

- **`app/index.tsx` — single source of truth.** The decision logic (`session` → login / onboarding / tabs based on `profile.onboarding_completed_at`) MUST live in exactly one place: the guarded effect in `app/_layout.tsx`. `app/index.tsx` MUST NOT independently dispatch competing `router.replace` calls. It may render the brand splash / a placeholder, or emit a single declarative redirect, but it MUST NOT duplicate the branching decision. The `useEffect` at `app/index.tsx` lines 15–28 is removed.

- **`app/(auth)/register.tsx` — in scope to verify, not necessarily rewrite.** Line ~51 calls `router.replace('/onboarding')` from the post-signup `Alert` "OK" handler. Once the navigator is always mounted, this call should succeed. The change does not require rewriting it, but the post-signup → onboarding transition MUST be exercised in QA and confirmed free of the "not handled by any navigator" error.

## How

In `app/_layout.tsx`:

1. Delete the early `if (loading || profileLoading) { return <BrandSplash />; }` block (lines 70–72).
2. Render `<Stack>` unconditionally. Render `<BrandSplash />` as an overlay sibling that is visible while `loading || profileLoading` (e.g. an absolutely-positioned full-screen layer above the `<Stack>`), so the navigator is mounted from first render but the user still sees only the splash until auth/profile resolves.
3. Add the expo-router readiness guard to the redirect effect: bail out of the effect (no `router.replace`) until the root navigation state is ready, in addition to the existing `if (loading || profileLoading) return;` guard. Verify the exact API via context7 first.

In `app/index.tsx`:

4. Remove the `React.useEffect` block (lines 15–28) and its now-unused dependencies. Leave `app/index.tsx` rendering the splash/placeholder (or a single declarative redirect) only — no branching `router.replace` logic.

No production code outside `app/_layout.tsx` and `app/index.tsx` is modified. `src/hooks/useAuth.tsx`'s public API, `app/onboarding.tsx`, the `<Stack.Screen>` registrations, and all auth logic are untouched. No visual or design changes — `BrandSplash` renders the same pixels; it is merely no longer gating the navigator.

## Scope

In scope:

- The two file edits described above (`app/_layout.tsx`, `app/index.tsx`).
- A context7 lookup to confirm the expo-router 6 navigation-readiness API before coding.
- A `npx tsc --noEmit` verification step.
- Manual QA: cold start (no session), login (session + onboarding incomplete), completing onboarding, login (session + onboarding complete), and post-signup from `register.tsx`.

## Non-Goals

- **Changing `useAuth`'s public API or its `loading` / `profileLoading` semantics.** The fix accommodates the existing true→false `profileLoading` cycle; it does not eliminate or reorder it.
- **Refactoring `app/onboarding.tsx` or the onboarding flow.** Only the route *into* onboarding is in scope.
- **Rewriting `app/(auth)/register.tsx`.** Its `router.replace('/onboarding')` is verified, not rewritten, unless QA proves it still fails after the navigator is always mounted.
- **Visual / design changes.** `BrandSplash` is rendered the same way visually; no new spinner, copy, color, or layout.
- **Converting the imperative redirect strategy to a fully declarative `<Redirect>` architecture.** Consolidating to one guarded imperative effect is sufficient for this bug fix; a declarative rearchitecture is a separate change.
- **Changing the route table or `<Stack.Screen>` registrations.**

## Risks and Mitigations

- **Splash overlay leaks navigator UI underneath.** If the splash overlay is not fully opaque / full-screen, a frame of the underlying `<Stack>` (e.g. `index` or a wrong screen) could flash before redirect. Mitigation: the overlay MUST be an opaque, full-bleed layer covering the entire viewport (including safe areas) while `loading || profileLoading`, identical in appearance to the current `<BrandSplash />`. QA explicitly checks for any flash of the wrong screen on cold start and after login.
- **Wrong readiness API for expo-router 6.** The recommended guard hook/field may differ in expo-router 6 / SDK 54 from older guides. Mitigation: the implementer MUST verify via context7 (`/expo/router`) before implementing, and confirm by reproducing the original error pre-fix and confirming it is gone post-fix on the exact transitions listed in acceptance criteria.
- **Removing `index.tsx` logic changes deep-link behavior to `/`.** If a user deep-links to `/` while logged in, the decision must still happen. Mitigation: the consolidated guarded effect in `app/_layout.tsx` already handles `segments[0] === undefined` (the root) — it redirects root → login/tabs/onboarding. QA includes launching directly at `/` in all three auth states.
- **`register.tsx` still races.** Its `router.replace('/onboarding')` fires from an `Alert` callback, which is after the navigator is mounted in practice, but is not covered by the `_layout.tsx` guard. Mitigation: QA exercises the signup → "OK" → onboarding path explicitly; if it still throws, the implementer applies the same readiness guard there as a follow-up within this change.

## Acceptance Criteria

QA verifies each independently. The "not handled by any navigator" error MUST NOT appear in any of the scenarios below (checked via the dev console / red-box).

1. The root `<Stack>` in `app/_layout.tsx` is rendered unconditionally — there is no code path in `RootLayoutNav()` that returns before `<Stack>` is mounted. Specifically, the early `return <BrandSplash />;` for `loading || profileLoading` no longer exists.
2. While `loading || profileLoading` is true, the user sees only the brand splash (visually identical to the pre-change `<BrandSplash />`), with no visible navigator content underneath and no flash of a wrong screen.
3. The redirect effect in `app/_layout.tsx` does not dispatch any `router.replace` until the root navigation is ready (per the expo-router 6 readiness API, verified via context7), in addition to its existing `loading || profileLoading` guard.
4. `app/index.tsx` contains no `router.replace` calls and no `useEffect` that branches the auth/onboarding/tabs decision. The branching decision exists in exactly one place: the guarded effect in `app/_layout.tsx`.
5. **No session** → after launch the user lands on `/(auth)/login`.
6. **Session + onboarding incomplete** (`profile.onboarding_completed_at` is null) → after launch / after login the user lands on `/onboarding`.
7. **Session + onboarding complete** → after launch / after login the user lands on `/(tabs)/buscar`.
8. Completing onboarding (which sets `onboarding_completed_at`) transitions the user to `/(tabs)/buscar` with no navigator error.
9. Cold start in each of the three auth states (no session / incomplete / complete) produces no "not handled by any navigator" error and no flash of the wrong screen.
10. The post-signup flow in `app/(auth)/register.tsx` (signup success → `Alert` "OK" → `router.replace('/onboarding')`) lands on `/onboarding` with no navigator error.
11. Launching directly at the root path `/` in each of the three auth states resolves to the correct screen (login / onboarding / tabs) with no navigator error.
12. `npx tsc --noEmit` passes with no new errors introduced by this change.
13. No files other than `app/_layout.tsx` and `app/index.tsx` are modified by this change (unless the `register.tsx` mitigation in Risks is triggered by QA, which must be called out in the PR description).

## Open Questions

None blocking. Items the implementer should resolve during implementation and note in the PR description:

- The exact expo-router 6 / SDK 54 navigation-readiness API (`useRootNavigationState()?.key` vs. an alternative) — confirm via context7 before coding.
- Whether `app/(auth)/register.tsx` required the same readiness guard (Risks mitigation) after QA, or worked unchanged once the navigator was always mounted.
