# Tasks: Wire the DameRide Brand Logo Across User-Facing Surfaces

Work top-down. Each phase is independently reviewable.

## Phase 1 — Audit current state

- [ ] 1.1 Read `app/(auth)/login.tsx` and locate the `<Image source={require('@/assets/images/hero_illustration.png')} … />` block (currently lines 59–62, wrapped in a `w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-surface-container` container with `Shadows.sm`). Note the surrounding `<View>` structure so you can preserve the "DameRide" wordmark + tagline immediately below.
- [ ] 1.2 Read `app/(auth)/register.tsx`. Confirm there is NO `hero_illustration` reference. If unexpectedly present, plan to migrate it the same way as login and flag in the PR description.
- [ ] 1.3 Run `rg -n "hero_illustration" app src components` and record every match. Expectation: exactly one match in `app/(auth)/login.tsx`.
- [ ] 1.4 Read `app/_layout.tsx` to confirm the current `RootLayoutNav` returns `<Stack>` directly, with no in-app branded fallback during `loading || profileLoading`.
- [ ] 1.5 Read `app.config.js` and confirm the `expo-splash-screen` plugin entry's current `backgroundColor` is `'#ffffff'` (and `dark.backgroundColor` is `'#000000'`).

## Phase 2 — Swap the login hero for `<DameRideLogo>`

- [ ] 2.1 In `app/(auth)/login.tsx`, replace the entire hero `<View>`+`<Image>` block (the `w-full aspect-[16/9] …` container plus the `<Image>` inside it) with a centered `<DameRideLogo size={…} accessibilityLabel="DameRide" />`. Choose a size in the 120–160 px range that visually balances against the wordmark/tagline below. Add `import { DameRideLogo } from '@/src/components/DameRideLogo';` (verify the export shape of `DameRideLogo.tsx` first — default or named — and import accordingly).
- [ ] 2.2 Remove the now-unused `Image` import from `react-native` if it has no remaining usages in `login.tsx`. Remove `Shadows` from the import if it is no longer used after dropping the hero container. Re-verify other usages before removing.
- [ ] 2.3 Adjust container padding/gap so the logo + wordmark + tagline group still reads balanced (the original `gap-3` on the parent and `gap-1` on the title group are reasonable defaults to keep).
- [ ] 2.4 Run `rg -n "hero_illustration" app/\(auth\)/login.tsx`. Confirm zero matches.

## Phase 3 — Create `<BrandSplash>`

- [ ] 3.1 Create `src/components/BrandSplash.tsx`. Export a React component (default or named — match the convention used by `DameRideLogo.tsx`). Props: `{ subtitle?: string }`. No required props.
- [ ] 3.2 The component renders a full-screen `<View>` (e.g. `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`, `backgroundColor: Colors.background`).
- [ ] 3.3 Inside, render `<DameRideLogo size={120} accessibilityLabel="DameRide" />` and, beneath it (with comfortable spacing — e.g. 12–16 px gap), a `<Text>` reading `DameRide`, styled with `Colors.primary` and the project's Jakarta extrabold font class (match the existing login wordmark styling — `font-jakarta-extrabold text-[30px]` or similar).
- [ ] 3.4 If `subtitle` is provided, render it below the wordmark in `Colors.onSurfaceVariant` at a smaller size (`font-jakarta text-sm` or similar). If `subtitle` is `undefined`, render nothing in that slot.
- [ ] 3.5 Do NOT render a spinner.
- [ ] 3.6 Run `npx tsc --noEmit`. Confirm no errors.

## Phase 4 — Wire `<BrandSplash>` into `app/_layout.tsx`

- [ ] 4.1 Import `BrandSplash` into `app/_layout.tsx` (match the export shape from Phase 3).
- [ ] 4.2 In `RootLayoutNav`, after the existing `useAuth()` destructure, add an early return: when `loading || profileLoading` is `true`, return `<BrandSplash />` (before the `useEffect` that drives navigation, or after it — either order is correct since the early return short-circuits the JSX, but the `useEffect` itself already no-ops when `loading || profileLoading`).
- [ ] 4.3 Verify the existing `if (!fontsLoaded) return null;` guard in `RootLayout` is unchanged. `<BrandSplash />` MUST only be reachable after fonts have loaded.
- [ ] 4.4 Run `npx tsc --noEmit`. Confirm no errors.

## Phase 5 — Update native splash background color

- [ ] 5.1 In `app.config.js`, in the `expo-splash-screen` plugin entry, change `backgroundColor: '#ffffff'` to `backgroundColor: '#F8F4EB'`. Leave the `image`, `imageWidth`, `resizeMode`, and `dark.backgroundColor` fields untouched.
- [ ] 5.2 Confirm `git status assets/images/` shows none of `splash-icon.png`, `icon.png`, `android-icon-foreground.png`, `dame-ride-logo.png`, or `hero_illustration.png` as modified.

## Phase 6 — Verification

- [ ] 6.1 Run `rg -n "hero_illustration" app src components`. Confirm zero matches.
- [ ] 6.2 Run `npx tsc --noEmit`. Confirm exit code 0.
- [ ] 6.3 Cold-launch the app on simulator. Confirm: (a) native splash is cream, not white; (b) immediately after native-splash-hide, `<BrandSplash>` (cream background, orange logo + wordmark) shows during auth resolution; (c) when not authenticated, the user lands on the login screen and sees the orange `<DameRideLogo>` where the green-car hero used to be; (d) no blank/white flash between any of these stages.
- [ ] 6.4 Confirm Spanish UI copy on the login screen is byte-identical (compare against the strings listed in proposal acceptance criterion #9).
- [ ] 6.5 In the PR description, record: the final size used for the login logo, confirmation that `register.tsx` had no `hero_illustration` reference, and whether `<BrandSplash>` flicker was perceptible during manual QA.
