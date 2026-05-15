# Fix Tab Bar Content Clipping

## Why

The four screens inside the `(tabs)` group (`perfil`, `reservas`, `publicar`, `buscar`) currently apply a hardcoded `paddingBottom: 100` (or `110` on `buscar`) to their scrollable container. The custom `StitchTabBar` rendered by `app/(tabs)/_layout.tsx` is `position: 'absolute'` and its real measured height is `insets.bottom + 72` — roughly 106 px on iPhones with a home indicator, ~88 px on Android with button nav, and more in landscape/tablet. The hardcoded constants are insufficient on modern iPhones: the last interactive element of each tab is clipped by the tab bar. The user's screenshot shows the "Cerrar sesión" button on `perfil` cut by the tab bar — same pattern affects the other three screens.

Root cause: padding is statically guessed rather than measured. The fix is to read the live tab-bar height from `useBottomTabBarHeight()` (provided by `@react-navigation/bottom-tabs`, already a transitive dependency through `expo-router`) and add a fixed 24 px of breathing room on top of it.

## What Changes

- **`app/(tabs)/perfil.tsx`** — Replace `contentContainerStyle={{ paddingBottom: 100 }}` on the `<ScrollView>` (line 66) with `paddingBottom: tabBarHeight + 24`.
- **`app/(tabs)/reservas.tsx`** — Same replacement on the `<ScrollView>` at line 89.
- **`app/(tabs)/publicar.tsx`** — Same replacement on the `<ScrollView>` at line 270.
- **`app/(tabs)/buscar.tsx`** — Replace `contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 16 }}` on the `<FlatList>` at line 512 with `{ paddingHorizontal: 20, paddingBottom: tabBarHeight + 24, gap: 16 }`. Preserve the existing `paddingHorizontal` and `gap`.

## How

In each of the four files:

1. Add `import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';` to the existing import block.
2. Inside the component body, call `const tabBarHeight = useBottomTabBarHeight();`.
3. Use `tabBarHeight + 24` as the `paddingBottom` value, merging into the existing `contentContainerStyle` object where one already has additional style keys (`buscar`).

No other production code changes. No new dependencies. No changes to the tab bar component, layout, or to screens outside `(tabs)`.

## Scope

In scope:

- The four file edits described above.
- A `npx tsc --noEmit` verification step.

## Non-Goals

- Fixing the perceived "top cut" of headers when scrolling. The `AppHeader` is intended to scroll out of view; that is normal `<ScrollView>` behavior, not a bug.
- Fixing screens outside the `(tabs)` group (e.g. `app/ride/[id].tsx`, `app/profile/edit.tsx`, `app/profile/vehicle.tsx`, `app/onboarding.tsx`, auth screens). These render inside the root Stack and never sit behind the tab bar.
- Refactoring the custom `StitchTabBar` component or replacing it with the default React Navigation tab bar.
- Replacing the literal `+ 24` with a named constant or theme spacing token. The buffer is small and local; a token sweep is a separate cleanup.

## Risks and Mitigations

- **`useBottomTabBarHeight()` returns 0 if the context is missing.** The hook reads from `BottomTabBarHeightCallbackContext`, which `expo-router`'s `Tabs` provides automatically — `app/(tabs)/_layout.tsx` uses `Tabs`, so the context is in the tree for all four screens. Mitigation: at implementation time, the implementer should log `tabBarHeight` once in dev to confirm a positive value (expect ~106 on iPhone 17 Pro simulator, ~88 on Android emulator). If `tabBarHeight` returns 0, the screen still renders but the fix degrades to no padding — that's an obvious visual regression and would be caught by the manual QA step below before merge.
- **The custom `StitchTabBar` may not register its measured height with the navigator.** React Navigation derives `useBottomTabBarHeight` from the actual rendered tab bar via `onLayout`; if `StitchTabBar` does not forward layout events, the hook returns the default style height. Mitigation: implementer verifies by logging; if broken, fallback to `useSafeAreaInsets().bottom + 72 + 24` (mirroring `StitchTabBar`'s own math) is a one-line swap.
- **Other screens may use the same hardcoded pattern.** A `rg` sweep confirms only the four files listed above contain `paddingBottom: 100` or `paddingBottom: 110` inside `app/(tabs)/`. No other ScrollView/FlatList lives in the tabs group.

## Acceptance Criteria

1. `app/(tabs)/perfil.tsx`, `app/(tabs)/reservas.tsx`, `app/(tabs)/publicar.tsx`, and `app/(tabs)/buscar.tsx` each import `useBottomTabBarHeight` from `@react-navigation/bottom-tabs`.
2. Each of the four screens calls `useBottomTabBarHeight()` once inside its component body and uses the returned value plus `24` as the `paddingBottom` of its scroll container's `contentContainerStyle`.
3. The literal `paddingBottom: 100` does NOT appear anywhere under `app/(tabs)/` after the change.
4. The literal `paddingBottom: 110` does NOT appear anywhere under `app/(tabs)/` after the change.
5. `app/(tabs)/buscar.tsx` preserves `paddingHorizontal: 20` and `gap: 16` on the `<FlatList>`'s `contentContainerStyle`.
6. `npx tsc --noEmit` passes with no new errors introduced by this change.
7. On the iOS simulator at iPhone 17 Pro size, the last interactive element of each tab screen is fully visible above the tab bar with at least 16 px of breathing room. The elements to verify are:
   - **`perfil`** — the "Cerrar sesión" button
   - **`publicar`** — the "Publicar viaje" submit button
   - **`reservas`** — the last reservation card in the list
   - **`buscar`** — the last result row in the `<FlatList>`
8. The fix continues to render correctly on Android (emulator with gesture nav and emulator with button nav) — no over-padding gap, no under-padding clip.

## Open Questions

None.
