# Rebrand DameRide to the Orange/Cream Identity

## Why

DameRide is being repositioned with a new visual identity built around a warm orange brand color, a yellow accent, and a cream canvas background — a deliberate move away from the green/blue Material-3 defaults the app inherited at bootstrap. The user owns the brand direction and has asked to "terminar el re-branding". This change formalizes the new palette as the single source of truth across **both** theme files and the Tailwind/NativeWind config, sweeps brand-coded hardcoded hex codes out of the codebase, and replaces inline renders of the raster logo with a hand-crafted vector component so the mark can be tinted from theme tokens.

Status colors (error red, WhatsApp green, amber utility) and dark-mode tokens are intentionally untouched. App icon, splash, and favicon raster assets are out of scope for this change because they require separate asset regeneration (icon generators, store-asset workflows) that should ship in a follow-up.

## What Changes

- **Theme tokens — primary brand source.** Update `src/constants/theme.ts` so every entry in the exported `Colors` object derives from the new palette. The full old-hex → new-hex mapping lives in `design.md` and is exhaustive for `primary*`, `secondary*`, `tertiary*`, `surface*`, `outline*`, `inverse*`, `background`, `onBackground`, and `onSurface*`. `error*`, `whatsappGreen`, `amber400`, `emerald50`, `emerald600`, `gray100`, and `gray400` are explicitly preserved at their current values. Update `Shadows.action.shadowColor` from `#006d37` to the new primary orange so elevation tint matches the brand.

- **Tailwind tokens — secondary source of truth for NativeWind classes.** Update `theme.extend.colors` in `tailwind.config.js` to mirror the new `Colors` values key-for-key. Every kebab-cased Tailwind key (`primary`, `primary-container`, `on-primary-container`, … `inverse-on-surface`) must end up with the same hex as its camelCase counterpart in `src/constants/theme.ts`. The `error-*` keys remain unchanged.

- **Resolve the duplicate root theme file.** A second file `constants/theme.ts` exists at the repo root and is still imported (via the `@/*` path alias) by `hooks/use-theme-color.ts`. It is **not** a duplicate of the brand theme — it is the Expo template's unused light/dark scaffold (`Colors.light.tint`, etc.). Do not delete it as part of this change; instead, audit whether `useThemeColor` is called anywhere. If not, flag the dead code in the change's tasks for separate removal. Either way, this rebrand only edits `src/constants/theme.ts`.

- **Logo as a reusable SVG component.** Create `src/components/DameRideLogo.tsx` using `react-native-svg` primitives (already a dependency, v15.12.1). Component API: `size: number` (required, sets both width and height), `color?: string` (optional, defaults to `Colors.primary`). Visual reconstruction: a rounded car body with a slightly raised dome roof and a small vertical handle/lock detail on top, two solid filled wheel circles, and a thin semicircle "smile" arc beneath the body. Geometry should be authored to read clearly at 24px and 96px alike. The PNG at `assets/images/dame-ride-logo.png` stays in place as a raster fallback and for asset slots (app icon, splash, favicon) that require raster.

- **Audit pass for brand-coded hex literals.** The implementer must grep `app/`, `src/`, `components/`, and `constants/` for the seven legacy brand hex codes listed in the acceptance criteria, plus a broader sweep of bare hex literals, and replace each on a case-by-case basis. Non-brand hex literals (e.g. third-party logos, fixed status indicator tints not represented by `error*`, map style overrides) should be left alone and called out in the implementer's PR description.

- **Replace inline raster logo usages.** Grep for `dame-ride-logo` across `app/`, `src/`, `components/`. For each inline render of the raster (i.e. `<Image source={require('.../dame-ride-logo.png')} />` used as a visible logo), replace with `<DameRideLogo size={…} />`. Asset-manifest references in `app.config.js`, `app.json`, splash configuration, or favicon configuration MUST be left untouched. A current grep returns zero source-file matches, so the implementer should re-verify at implementation time; if there are still no matches, the migration task collapses to "verified, nothing to migrate" and only the new component is shipped.

## Scope

In scope:
- Token rewrite in `src/constants/theme.ts` (including `Shadows.action.shadowColor`).
- Token rewrite in `tailwind.config.js` under `theme.extend.colors`.
- New `src/components/DameRideLogo.tsx` SVG component.
- Hex-literal audit across `app/`, `src/`, `components/`, `constants/`.
- Replacement of inline raster-logo renders with the new SVG component, where any exist.
- Spanish UI copy is unchanged — this is a visual rebrand only.

## Non-Goals

- **App icon, splash screen, and favicon raster regeneration.** These require running an icon generator against the new palette and re-cutting Android adaptive layers; they ship in a separate change.
- **Dark-mode palette.** The app currently has no dark theme wired through `src/constants/theme.ts`. A dark variant of the new palette is out of scope.
- **Status color changes.** `error*`, `whatsappGreen`, `amber400`, `emerald50`, `emerald600`, `gray100`, `gray400` keep their current values.
- **Marketing assets / store screenshots / press kit.**
- **Typography or radius changes.** `Spacing`, `Radius`, and `Shadows` (other than `Shadows.action.shadowColor`) are not touched.
- **Removing the root `constants/theme.ts` Expo-template scaffold.** Flagged for a separate cleanup change.

## Risks and Mitigations

- **Contrast on cream background.** The new canvas is `#F8F4EB`. Body text on cream must still hit WCAG AA (4.5:1) at minimum. Mitigation: the chosen `onSurface` ink is `#0F0F0F`, which yields a contrast ratio of ~19:1 on `#F8F4EB`; well above AA. The implementer must spot-check secondary text colors (`onSurfaceVariant`, `outline`) against AA before merging.
- **Orange-on-cream button readability.** Primary CTAs are `#FF6B1A` background with white text (`onPrimary: #FFFFFF`). Contrast ratio ~3.5:1 — borderline for normal body text but acceptable for large/bold button labels (WCAG AA Large: 3:1). Mitigation: keep button typography bold and >=16pt, which is already the convention in this codebase.
- **Regression risk from a blanket hex sweep.** Replacing every hex literal mechanically can recolor unrelated UI (third-party logos, deliberately-fixed status tints). Mitigation: the audit task explicitly requires a per-occurrence review and forbids `replace_all`.
- **Two theme sources drifting.** The whole point of this change is that `src/constants/theme.ts` and `tailwind.config.js` must move together. Mitigation: the acceptance criteria require both files' `primary`/`secondary` to compare equal, and the token mapping in `design.md` is the single canonical reference both files derive from.
- **Logo reconstruction fidelity.** A hand-authored SVG will not match the raster pixel-for-pixel. Mitigation: the implementer should compare visual screenshots side-by-side at 24, 48, and 96 px; the goal is a recognizable mark that respects theme tokens, not a tracing.

## Acceptance Criteria

QA can verify each line independently:

1. `Colors.primary` in `src/constants/theme.ts` equals the string `'#FF6B1A'`.
2. `Colors.secondary` in `src/constants/theme.ts` equals the string `'#F5C518'`.
3. The Tailwind config exports `primary: '#FF6B1A'` and `secondary: '#F5C518'` under `theme.extend.colors`, and running the project's Tailwind build (whatever `npx expo start` or `tailwindcss` invocation the repo uses) does not error.
4. `npx tsc --noEmit` passes with no new errors introduced by this change.
5. Across `app/`, `src/`, `components/`, `constants/`, and `tailwind.config.js`, there are zero remaining string occurrences of the legacy brand hex codes (case-insensitive): `#006d37`, `#2ecc71`, `#005027`, `#6bfe9c`, `#4ae183`, `#0051d3`, `#226afc`.
6. `src/components/DameRideLogo.tsx` exists, exports a default React component, renders without runtime errors when mounted with `<DameRideLogo size={48} />`, and accepts a `size: number` prop and an optional `color?: string` prop that defaults to `Colors.primary`.
7. Every place in `app/`, `src/`, or `components/` that previously rendered `assets/images/dame-ride-logo.png` inline as a visible logo (NOT app icon, splash, or favicon asset-manifest references) now renders `<DameRideLogo />`. If no inline usages exist at implementation time, this criterion is satisfied vacuously and the implementer must state so in the PR description.
8. The raster files `assets/images/dame-ride-logo.png`, `assets/images/icon.png`, `assets/images/android-icon-foreground.png`, `assets/images/splash-icon.png`, and any favicon raster in `assets/` are byte-identical to their pre-change versions.
9. The following `Colors` keys are byte-identical to their pre-change values: `error`, `errorContainer`, `onError`, `onErrorContainer`, `whatsappGreen`, `amber400`, `emerald50`, `emerald600`, `gray100`, `gray400`. The corresponding Tailwind keys (`error`, `error-container`, `on-error`, `on-error-container`) are also unchanged.
10. `Shadows.action.shadowColor` equals `'#FF6B1A'`.
11. The duplicate root `constants/theme.ts` file is **not** modified by this change. Whether it is later deleted is tracked separately.

## Open Questions

None blocking. The implementer should record, in the PR description, any hex literal they intentionally chose **not** to migrate (and why), so the rebrand audit is reviewable.
