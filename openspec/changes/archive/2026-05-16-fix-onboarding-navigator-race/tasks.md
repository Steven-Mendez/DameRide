# Tasks: Fix Onboarding Navigator Race

Phases are ordered. Phase 1 is a prerequisite lookup. Phases 2–4 are the code edits in dependency order. Phase 5 is verification and manual QA.

## Phase 1 — Confirm the readiness API

- [x] 1.1 Use context7 (`/expo/router`, or the Expo docs site) to confirm the idiomatic navigation-readiness guard for **expo-router 6 / Expo SDK 54**. Expected: `useRootNavigationState()` and only dispatching navigation once its `?.key` is defined. Record the exact hook and field used in the PR description. — Confirmed against installed expo-router 6.0.23 type defs + impl: `useRootNavigationState()` from `expo-router`; guard on `navigationState?.key != null` (state is `undefined` until the root NavigationContainer mounts).

## Phase 2 — Always render the navigator in `app/_layout.tsx`

- [x] 2.1 In `app/_layout.tsx`, delete the early-return block (lines 70–72):
  ```tsx
  if (loading || profileLoading) {
    return <BrandSplash />;
  }
  ```
- [x] 2.2 Render `<BrandSplash />` as an opaque, full-screen overlay layered on top of the always-mounted `<Stack>` (e.g. an absolutely-positioned sibling inside the existing `<>` fragment) that is shown only while `loading || profileLoading`. The `<Stack>` (lines 76–102) must remain mounted on every render. Do not change the `<Stack.Screen>` registrations. The splash must visually match the pre-change full-screen `<BrandSplash />` (cover safe areas, no underlying screen visible). — Wrapped in `<View style={StyleSheet.absoluteFill} pointerEvents="auto">`; BrandSplash is `flex:1` opaque `Colors.background`, so it is full-bleed and blocks the navigator underneath.

## Phase 3 — Guard the redirect effect on navigation readiness

- [x] 3.1 In `app/_layout.tsx`, add the readiness hook confirmed in 1.1 to `RootLayoutNav()`. — `const navigationState = useRootNavigationState(); const navigationReady = navigationState?.key != null;`
- [x] 3.2 In the redirect `useEffect` (lines 49–68), add an early `return` so no `router.replace` fires until the root navigation is ready, in addition to the existing `if (loading || profileLoading) return;`. Add the readiness value to the effect's dependency array. — Added `if (!navigationReady) return;`; `navigationReady` added to deps.
- [x] 3.3 Confirm the existing branching (lines 57–67: `!session` → `/(auth)/login`; `session && !onboardingComplete && !inOnboarding` → `/onboarding`; `session && onboardingComplete && inOnboarding` → `/(tabs)/buscar`; `session && onboardingComplete && (inAuthGroup || root)` → `/(tabs)/buscar`) is preserved verbatim — only the guard is added, the decision is unchanged. — Branching copied verbatim; only the two guard returns and dep added.

## Phase 4 — Remove duplicated redirect logic from `app/index.tsx`

- [x] 4.1 In `app/index.tsx`, delete the `React.useEffect` block (lines 15–28) that dispatches `router.replace('/(auth)/login')` / `'/(tabs)/buscar'` / `'/onboarding'`. — Removed.
- [x] 4.2 Remove now-unused imports/locals (`useRouter`/`router`, `useAuth` destructure of `session`/`profile`/`profileLoading`) if and only if nothing else in the file uses them. Leave the rest of the rendered tree intact (it remains a valid screen / placeholder). Do not introduce a competing declarative redirect that re-duplicates the decision — the decision lives only in `app/_layout.tsx`. — Removed `React`, `useAuth`, and the `session`/`profile`/`profileLoading` destructure. Kept `useRouter`/`router` because the rendered tree still uses `router.push('/(auth)/login')`. No declarative redirect added.
- [x] 4.3 Confirm `app/index.tsx` no longer contains any `router.replace` call. — `grep -E 'router\.replace\(' app/index.tsx` → 0 matches.

## Phase 5 — Verification & manual QA

- [x] 5.1 Run `npx tsc --noEmit` — confirm no new errors. — `npm run validate` (lint + `tsc --noEmit`) passed, exit 0.
- [x] 5.2 Grep `app/index.tsx` for `router.replace` — confirm zero matches. — `grep -E 'router\.replace\('` → 0 calls (only the word appears inside an explanatory comment).
- [x] 5.3 Grep `app/_layout.tsx` for `return <BrandSplash` — confirm the early-return form is gone (splash is now an overlay sibling, not an early return). — 0 matches; splash is now an `absoluteFill` overlay sibling of `<Stack>`.
- [ ] 5.4 Reproduce the original bug **before** applying the fix on a scratch run (or rely on the prior report) so the post-fix QA is a true before/after on the same transitions. — DEFERRED: requires a running simulator/device; relying on the parent's pre-confirmed root-cause diagnosis.
- [ ] 5.5 Manual QA — cold start, no session: launch the app with no Supabase session → lands on `/(auth)/login`. No "not handled by any navigator" error. No flash of a wrong screen; splash shows until login renders. — DEFERRED: manual device QA, not runnable in this environment.
- [ ] 5.6 Manual QA — login, onboarding incomplete: log in as a user whose `profile.onboarding_completed_at` is null → lands on `/onboarding`. No navigator error during the `profileLoading` true→false cycle. — DEFERRED: manual device QA.
- [ ] 5.7 Manual QA — complete onboarding: finish the onboarding flow (sets `onboarding_completed_at`) → transitions to `/(tabs)/buscar`. No navigator error. — DEFERRED: manual device QA.
- [ ] 5.8 Manual QA — login, onboarding complete: log in as a user with `onboarding_completed_at` set → lands on `/(tabs)/buscar`. No navigator error. — DEFERRED: manual device QA.
- [ ] 5.9 Manual QA — post-signup from register: complete signup in `app/(auth)/register.tsx`, tap "OK" on the success alert → lands on `/onboarding` with no navigator error. If it still throws, apply the same readiness guard to the `register.tsx` redirect (Risks mitigation) and note it in the PR. — DEFERRED: manual device QA. Static analysis: the Alert "OK" callback fires only after user interaction, long after the now-always-mounted navigator is ready, so no guard mitigation was needed; `register.tsx` left unmodified per spec.
- [ ] 5.10 Manual QA — direct root launch: launch directly at `/` in each of the three auth states → resolves to the correct screen with no navigator error. — DEFERRED: manual device QA. The consolidated guarded effect handles `segments[0] === undefined` (root) for all three states.
- [x] 5.11 Confirm no files other than `app/_layout.tsx` and `app/index.tsx` were modified (or, if the 5.9 mitigation was triggered, `app/(auth)/register.tsx` plus a note in the PR description). — `git status` confirms only `app/_layout.tsx` and `app/index.tsx` modified; `register.tsx` untouched (mitigation not triggered).
