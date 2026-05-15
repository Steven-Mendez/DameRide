# Tasks: Rebrand DameRide to the Orange/Cream Identity

Work top-down. Each phase is independently reviewable. Do not run a blanket find-and-replace; the audit phase requires per-occurrence judgment.

## Phase 1 — Theme tokens

- [ ] 1.1 Rewrite the `Colors` object in `src/constants/theme.ts` so every key takes its new value from the **`design.md` → "Full token mapping — src/constants/theme.ts"** table. Preserve the existing key order and the `as const` assertion. Do not change `Spacing` or `Radius`.
- [ ] 1.2 In the same file, change `Shadows.action.shadowColor` from `'#006d37'` to `'#FF6B1A'`. Leave all other `Shadows.*.shadowColor` entries (`'#000000'`) alone.
- [ ] 1.3 Confirm `npx tsc --noEmit` passes.

## Phase 2 — Tailwind tokens

- [ ] 2.1 Rewrite `theme.extend.colors` in `tailwind.config.js` so every kebab-cased key matches the value in **`design.md` → "Full token mapping — tailwind.config.js"** table. Do not change `fontFamily`, `borderRadius`, or `spacing` blocks.
- [ ] 2.2 Run the project's Tailwind build path (e.g. `npx expo start` once in dev mode, or whatever the project uses). Confirm no Tailwind errors.

## Phase 3 — Hex-literal audit

- [ ] 3.1 Run the legacy-seven grep from **`design.md` → "Hex-literal audit procedure"** against `app/`, `src/`, `components/`, `constants/`, and `tailwind.config.js`. Review each match.
- [ ] 3.2 For each match, choose one: replace with the new mapped hex, replace with a token import (`Colors.*` or a Tailwind class), or leave alone if it's genuinely non-brand. Record any "leave alone" decisions in the PR description.
- [ ] 3.3 Run the broad bare-hex grep across `app/`, `src/`, `components/`. Review each match the same way. **Do not** use `replace_all`. Non-brand hex codes (status colors, third-party logos, map style strings) stay.
- [ ] 3.4 Re-run the legacy-seven grep across `app/`, `src/`, `components/`, `constants/`, and `tailwind.config.js`. Verify the result is empty.

## Phase 4 — DameRideLogo SVG component

- [ ] 4.1 Create `src/components/DameRideLogo.tsx` per the spec in **`design.md` → "DameRideLogo component"**. Use `react-native-svg` primitives. Component must accept `size: number` and `color?: string` (default `Colors.primary`). Render at a 64x64 viewBox.
- [ ] 4.2 Locally render the component at sizes 24, 48, and 96 in a temporary scratch screen (or the existing `app/index.tsx`) and verify the mark reads clearly at each size. Remove the scratch render before committing.
- [ ] 4.3 Run `npx tsc --noEmit` and confirm no errors.

## Phase 5 — Replace inline raster logo renders

- [ ] 5.1 Run `rg -n --no-heading 'dame-ride-logo' app src components` and list each match.
- [ ] 5.2 For each inline render of the raster as a visible logo (i.e. `<Image source={require('…/dame-ride-logo.png')} />`), replace with `<DameRideLogo size={…} />` using a size that visually matches the previous `style.width`/`style.height`. Asset-manifest references in `app.config.js`, `app.json`, splash config, or favicon config are NOT touched.
- [ ] 5.3 If no inline usages exist, record that fact in the PR description and skip the replacement work.
- [ ] 5.4 Verify the raster files `assets/images/dame-ride-logo.png`, `assets/images/icon.png`, `assets/images/android-icon-foreground.png`, `assets/images/splash-icon.png`, and any favicon under `assets/` are byte-identical to their pre-change versions (e.g. `git status` shows them clean).

## Phase 6 — Dead-code check for root `constants/theme.ts`

- [ ] 6.1 Run `rg -n --no-heading 'useThemeColor' app src components hooks` to see whether `hooks/use-theme-color.ts` is consumed anywhere.
- [ ] 6.2 If `useThemeColor` is unused, add a one-line note in the PR description recommending a follow-up cleanup change to delete `hooks/use-theme-color.ts`, `hooks/use-color-scheme.ts` (if also unused), and the root `constants/theme.ts`. Do **not** delete them in this change.
- [ ] 6.3 If `useThemeColor` is used somewhere, list the callsites in the PR description and explicitly note that the rebrand does not affect those screens because they use the Expo template's light/dark scaffold, not the brand theme.

## Phase 7 — Manual QA

- [ ] 7.1 Cold-launch the app on iOS simulator and Android emulator. Confirm screens render with cream backgrounds and orange CTAs; no green or blue surfaces remain on the primary flows (onboarding, home, search, publish, profile).
- [ ] 7.2 Spot-check body text contrast on cream (`onSurface` on `background`) and secondary text contrast (`onSurfaceVariant` on `background`) using the simulator's accessibility inspector or any contrast checker. Confirm both pass WCAG AA.
- [ ] 7.3 Tap a primary CTA — verify the elevation/shadow color around it tints orange, not green.
- [ ] 7.4 Open any screen that previously rendered the inline logo (if any were found in 5.1). Confirm the SVG renders correctly and is tinted by `Colors.primary`.
- [ ] 7.5 Confirm error states, WhatsApp-share buttons, and amber utility tints are visually unchanged.
- [ ] 7.6 Confirm the app icon, splash screen, and favicon still render with the **old** assets — these are out of scope and must not have changed.
