# Wire the DameRide Brand Logo Across User-Facing Surfaces

## Why

The `rebrand-orange-palette` change introduced `src/components/DameRideLogo.tsx` — a themeable SVG mark that defaults to `Colors.primary` — but the component currently has zero callers. Meanwhile, the login screen still renders the legacy green-car `assets/images/hero_illustration.png` as a full-width banner (see `app/(auth)/login.tsx`, lines 59–62), which reads as off-brand against the new cream + orange palette. The user also experiences a brief blank flash between native-splash-hide and the first screen render, because `app/_layout.tsx` returns immediately into `<Stack>` while `useAuth()`'s `loading` / `profileLoading` are still resolving — there is no in-app branded fallback.

This change wires the new logo into the surfaces where the user actually sees it: the login hero, and a new branded in-app splash that fills the auth-bootstrap gap. It also retunes the native splash background color to the new brand cream so the hand-off from native splash → in-app splash → first screen feels continuous. Regenerating the `splash-icon.png` raster is **out of scope** (requires raster tooling not available locally) and is deferred to a follow-up.

## What Changes

- **Replace the legacy login hero.** In `app/(auth)/login.tsx`, swap the `<Image source={require('@/assets/images/hero_illustration.png')} />` block (currently wrapped in a `w-full aspect-[16/9] rounded-[24px] overflow-hidden bg-surface-container` container with `Shadows.sm`) for a centered `<DameRideLogo size={…} accessibilityLabel="DameRide" />`. The visible "DameRide" wordmark `<Text>` and the tagline below the hero stay as-is. The implementer picks a balanced logo size (roughly 120–160 px) and reshapes the container so the swap reads cleanly — the original 16:9 banner aspect is no longer appropriate for a square geometric mark.
- **No change to `app/(auth)/register.tsx`.** A pre-implementation read of `register.tsx` confirms it does NOT reference `hero_illustration.png`; it already uses a text-only `DameRide` header (line 76–78). The implementer must verify this again at implementation time and, if confirmed, leave the file untouched and note it in the PR description.
- **New `<BrandSplash>` component.** Create `src/components/BrandSplash.tsx`. Full-screen `View` with a cream background (`Colors.background`), centered `<DameRideLogo size={120} accessibilityLabel="DameRide" />`, and a "DameRide" wordmark `<Text>` directly beneath in `Colors.primary` using the project's existing Jakarta extrabold style (matching the existing login wordmark conventions). No spinner — the component is intentionally static and clean. Props: optional `subtitle?: string` for future use; default renders no subtitle. No props are required.
- **Wire `<BrandSplash>` into `app/_layout.tsx`.** Inside `RootLayoutNav`, when `loading || profileLoading` is `true` (both come from `useAuth()`), render `<BrandSplash />` instead of falling through to the `<Stack>`. This replaces the current behavior where the layout returns `<Stack>` immediately even while auth is unresolved, producing a blank flash. The early return MUST happen **after** fonts are loaded (so the wordmark doesn't render in a fallback system font) — i.e. after the existing `if (!fontsLoaded) return null;` guard in `RootLayout`. `<BrandSplash />` must NOT be rendered when fonts are still loading.
- **Native splash background color.** In `app.config.js`, change the `expo-splash-screen` plugin's `backgroundColor` from `'#ffffff'` to `'#F8F4EB'` (cream — equal to `Colors.background`). The `image` field (`./assets/images/splash-icon.png`), `imageWidth`, and `resizeMode` are left untouched. The existing `dark.backgroundColor: '#000000'` block is also left untouched — the project has no documented dark-mode brand spec, and updating it is deferred.
- **Legacy raster file is NOT deleted.** `assets/images/hero_illustration.png` stays on disk; this change only stops referencing it. A follow-up cleanup change will delete the file once it is verified unused everywhere.

## Scope

In scope:
- Editing `app/(auth)/login.tsx` to replace the legacy hero image with `<DameRideLogo />`.
- Creating `src/components/BrandSplash.tsx`.
- Editing `app/_layout.tsx` to render `<BrandSplash />` while `loading || profileLoading` is true (after fonts load).
- Editing `app.config.js` to set `expo.splash.backgroundColor` to `'#F8F4EB'`.
- Verifying `app/(auth)/register.tsx` has no `hero_illustration` reference; if confirmed, no edit.

## Non-Goals

- **Regenerating `splash-icon.png`.** Requires raster tooling and is its own change.
- **Deleting `assets/images/hero_illustration.png`.** Stays on disk; cleanup deferred.
- **Animating `<BrandSplash>`** (Lottie / Reanimated). Static is fine for v1.
- **Adding the logo to tab-bar headers, profile screens, or other surfaces.** Separate styling change.
- **Updating the native splash dark-mode background.** No dark-mode brand spec yet.
- **Spanish UI copy changes.** All existing strings are preserved verbatim.

## Risks and Mitigations

- **Login layout regression.** The legacy hero was a full-width 16:9 banner; the logo is a square geometric mark. A naive swap could leave awkward whitespace where the banner used to be. Mitigation: the implementer reshapes the container — drop the `aspect-[16/9]` and `rounded-[24px] overflow-hidden bg-surface-container` framing, center the logo, and adjust top padding so the screen reads balanced. This is judgment work, not a spec line.
- **`<BrandSplash>` flicker during fast auth resolution.** If `loading || profileLoading` flips to `false` within ~100 ms, the user sees a brief flash of `<BrandSplash>` and immediately the next screen. Mitigation: acceptable for v1 — it is strictly better than the current blank flash. If QA finds it distracting, a follow-up can add a min-display-time (e.g. 300 ms).
- **Font-fallback flash on `<BrandSplash>`.** If `<BrandSplash>` rendered before fonts loaded, the wordmark would render in a system fallback font, which would look broken. Mitigation: keep the existing `if (!fontsLoaded) return null;` guard ahead of the `<BrandSplash>` render — fonts always finish before `<BrandSplash>` is mounted.
- **Native splash → in-app splash color mismatch.** Today the native splash is white (`#ffffff`); the in-app cream would create a visible color step. Mitigation: setting native splash to `#F8F4EB` (this change) makes the hand-off continuous.

## Acceptance Criteria

QA can verify each line independently:

1. `rg -n "hero_illustration" app src components` returns no matches.
2. `app/(auth)/login.tsx` imports `DameRideLogo` from `@/src/components/DameRideLogo` and renders `<DameRideLogo … />` in the location formerly occupied by the hero `<Image>`.
3. `app/(auth)/register.tsx` is unchanged by this PR (verified by `git diff app/(auth)/register.tsx` returning empty), or — if a prior unknown `hero_illustration` reference is found at implementation time — it is also migrated and the deviation is noted in the PR description.
4. `src/components/BrandSplash.tsx` exists. It exports a React component that takes no required props, accepts an optional `subtitle?: string` prop, and renders: a full-screen `View` with `backgroundColor` equal to `Colors.background`, a centered `<DameRideLogo size={120} accessibilityLabel="DameRide" />`, and a "DameRide" wordmark `<Text>` colored `Colors.primary` directly beneath.
5. `app/_layout.tsx` returns `<BrandSplash />` early when `loading || profileLoading` from `useAuth()` is `true`, and only after the `if (!fontsLoaded) return null;` guard has passed. The `<Stack>` is not mounted in that state.
6. In `app.config.js`, the `expo-splash-screen` plugin entry has `backgroundColor: '#F8F4EB'`. The `image` field equals `'./assets/images/splash-icon.png'` (unchanged), `imageWidth` and `resizeMode` are unchanged, and the `dark.backgroundColor` entry is unchanged.
7. `npx tsc --noEmit` exits 0.
8. `git status assets/images/` does NOT show `splash-icon.png`, `icon.png`, `android-icon-foreground.png`, `dame-ride-logo.png`, or `hero_illustration.png` as modified.
9. All Spanish UI copy in `login.tsx` ("Comparte tu ruta, ahorra dinero y viaja acompañado.", "Crear cuenta", "o inicia con correo", "Correo electrónico", "Contraseña", "Iniciar sesion", "Tu contraseña") is preserved verbatim.

## Open Questions

None blocking. Items the implementer should record in the PR description:
- Final chosen size for the login logo (likely 120–160 px) and whether the container framing was kept, simplified, or removed entirely.
- Confirmation that `register.tsx` had no `hero_illustration` reference (expected) so no edit was made.
- Whether `<BrandSplash>` flicker on fast auth resolution was perceptible during manual QA. If yes, flag a follow-up for a min-display-time.
