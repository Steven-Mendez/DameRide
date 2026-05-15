# Tasks: Fix Tab Bar Content Clipping

Each task is a discrete file edit. Phase 1 tasks are independent and may be done in any order; Phase 2 is the final verification.

## Phase 1 — Replace hardcoded padding with measured tab-bar height

- [ ] 1.1 In `app/(tabs)/perfil.tsx`:
  - Add `import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';` to the existing import block.
  - Inside the component, add `const tabBarHeight = useBottomTabBarHeight();`.
  - On the `<ScrollView>` at line 66, change `contentContainerStyle={{ paddingBottom: 100 }}` to `contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}`.

- [ ] 1.2 In `app/(tabs)/reservas.tsx`:
  - Add `import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';`.
  - Add `const tabBarHeight = useBottomTabBarHeight();` inside the component.
  - On the `<ScrollView>` at line 89, change `contentContainerStyle={{ paddingBottom: 100 }}` to `contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}`.

- [ ] 1.3 In `app/(tabs)/publicar.tsx`:
  - Add `import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';`.
  - Add `const tabBarHeight = useBottomTabBarHeight();` inside the component.
  - On the `<ScrollView>` at line 270, change `contentContainerStyle={{ paddingBottom: 100 }}` to `contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}`.

- [ ] 1.4 In `app/(tabs)/buscar.tsx`:
  - Add `import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';`.
  - Add `const tabBarHeight = useBottomTabBarHeight();` inside the component.
  - On the `<FlatList>` at line 512, change `contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 16 }}` to `contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarHeight + 24, gap: 16 }}`.

- [ ] 1.5 Optional dev sanity check: temporarily `console.log('tabBarHeight', tabBarHeight)` in one of the four files, launch on the iOS simulator, confirm the value is positive (~106 on iPhone 17 Pro). Remove the log before committing.

## Phase 2 — Verification

- [ ] 2.1 Run `rg -n "paddingBottom: 100" app/\(tabs\)` and confirm zero matches.
- [ ] 2.2 Run `rg -n "paddingBottom: 110" app/\(tabs\)` and confirm zero matches.
- [ ] 2.3 Run `rg -n "useBottomTabBarHeight" app/\(tabs\)` and confirm four matching files (the four edited above).
- [ ] 2.4 Run `npx tsc --noEmit` and confirm it passes without new errors.
- [ ] 2.5 Manual QA on iOS simulator (iPhone 17 Pro):
  - Open `perfil` → scroll to bottom → "Cerrar sesión" button is fully visible with breathing room above the tab bar.
  - Open `publicar` → scroll to bottom → "Publicar viaje" button is fully visible.
  - Open `reservas` (with at least one reservation) → scroll to bottom → last card is fully visible.
  - Open `buscar` (with at least one result) → scroll to bottom → last row is fully visible.
- [ ] 2.6 Manual QA on Android emulator (one device with gesture nav, one with button nav if available):
  - Repeat the four checks above. Confirm padding is neither excessive (large empty gap) nor insufficient (clipped content).
