# navigation Specification

## Purpose
TBD - created by archiving change fix-onboarding-navigator-race. Update Purpose after archive.
## Requirements
### Requirement: The root navigator MUST always be mounted

`RootLayoutNav()` in `app/_layout.tsx` SHALL render the root `<Stack>` navigator on every render. There MUST NOT be any code path in `RootLayoutNav()` that returns before `<Stack>` is mounted — in particular, the brand splash MUST NOT be returned in place of the navigator while authentication or profile data is loading.

While `loading || profileLoading` is true, the brand splash SHALL be presented as an opaque, full-screen overlay layered on top of the always-mounted `<Stack>` (covering the entire viewport including safe areas), visually identical to the pre-change `<BrandSplash />`. This guarantees that a mounted navigator exists at the moment any `router.replace` is dispatched, so navigation actions are always handled by a navigator.

#### Scenario: Navigator survives the profile-loading cycle after login

- **GIVEN** a user logs in and `useAuth` flips `profileLoading` from true to false as it refetches the profile
- **WHEN** the redirect effect dispatches `router.replace('/onboarding')` during that cycle
- **THEN** a mounted `<Stack>` navigator handles the action
- **AND** no "The action 'REPLACE' ... was not handled by any navigator" error is thrown

#### Scenario: Splash is shown without unmounting the navigator

- **GIVEN** the app is in the `loading || profileLoading` state on cold start
- **WHEN** the user looks at the screen
- **THEN** only the brand splash is visible (visually identical to the previous `<BrandSplash />`)
- **AND** no underlying navigator screen is visible behind or instead of it
- **AND** the `<Stack>` is nonetheless mounted in the React tree

### Requirement: Imperative auth redirects MUST wait for navigation readiness

The redirect `useEffect` in `app/_layout.tsx` SHALL NOT dispatch any `router.replace` until the root navigation state is ready, using the navigation-readiness signal recommended for expo-router 6 / Expo SDK 54 (e.g. `useRootNavigationState()` with navigation deferred until its `?.key` is defined; the exact API to be confirmed against the expo-router documentation at implementation time). This guard is in addition to the existing `loading || profileLoading` guard. The readiness value MUST be included in the effect's dependency array so the redirect runs once navigation becomes ready.

#### Scenario: No redirect dispatched before navigation is ready

- **GIVEN** the root `<Stack>` has just mounted but expo-router's root navigation state is not yet ready
- **WHEN** the redirect effect runs in that render cycle
- **THEN** the effect returns early without calling `router.replace`
- **AND** once navigation becomes ready, the effect re-runs and performs the redirect exactly once

#### Scenario: Cold start in every auth state is error-free

- **GIVEN** the app is cold-started in each of: no session, session with onboarding incomplete, session with onboarding complete
- **WHEN** the app resolves auth/profile and routes the user
- **THEN** no "not handled by any navigator" error occurs in any of the three states
- **AND** no flash of a wrong screen is visible before the correct screen renders

### Requirement: The auth/onboarding/tabs routing decision MUST have a single source of truth

The decision of where to route the user based on session and onboarding state SHALL exist in exactly one place: the guarded redirect effect in `app/_layout.tsx`. `app/index.tsx` MUST NOT contain any `router.replace` call and MUST NOT contain a `useEffect` (or declarative redirect) that re-derives the session / `onboarding_completed_at` branching. `app/index.tsx` may render the brand splash or a placeholder only.

The single decision MUST preserve exactly this behavior:

- No session → `/(auth)/login`
- Session AND `profile.onboarding_completed_at` is null → `/onboarding`
- Session AND `profile.onboarding_completed_at` is set → `/(tabs)/buscar`

#### Scenario: No competing REPLACE dispatches

- **GIVEN** the app is resolving the post-login transition
- **WHEN** the routing decision is made
- **THEN** only the guarded effect in `app/_layout.tsx` dispatches `router.replace`
- **AND** `app/index.tsx` dispatches no navigation action

#### Scenario: No session lands on login

- **GIVEN** there is no Supabase session
- **WHEN** the app launches (including launching directly at the root path `/`)
- **THEN** the user lands on `/(auth)/login` with no navigator error

#### Scenario: Session with incomplete onboarding lands on onboarding

- **GIVEN** there is a session AND `profile.onboarding_completed_at` is null
- **WHEN** the app launches or the user logs in
- **THEN** the user lands on `/onboarding` with no navigator error

#### Scenario: Session with complete onboarding lands on tabs

- **GIVEN** there is a session AND `profile.onboarding_completed_at` is set
- **WHEN** the app launches or the user logs in
- **THEN** the user lands on `/(tabs)/buscar` with no navigator error

#### Scenario: Completing onboarding advances to tabs

- **GIVEN** the user is on `/onboarding` and completes the flow, setting `onboarding_completed_at`
- **WHEN** the profile updates
- **THEN** the user transitions to `/(tabs)/buscar` with no navigator error

### Requirement: The post-signup redirect MUST be exercised and error-free

The post-signup transition in `app/(auth)/register.tsx` (signup success → `Alert` "OK" → `router.replace('/onboarding')`) SHALL land the user on `/onboarding` without the "not handled by any navigator" error, given the root navigator is now always mounted. This change does not require rewriting `register.tsx`, but the flow MUST be exercised in QA; if it still throws, the same navigation-readiness guard MUST be applied to that redirect.

#### Scenario: Signup success routes to onboarding

- **GIVEN** a user completes signup successfully in `app/(auth)/register.tsx`
- **WHEN** the user taps "OK" on the success alert and `router.replace('/onboarding')` fires
- **THEN** the user lands on `/onboarding`
- **AND** no "not handled by any navigator" error is thrown

