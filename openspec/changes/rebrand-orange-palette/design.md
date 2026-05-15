# Design: Rebrand DameRide to the Orange/Cream Identity

## Canonical palette

| Role | Hex | Notes |
| --- | --- | --- |
| **Primary (brand orange)** | `#FF6B1A` | Logo, CTAs, primary tint, action shadow |
| **Primary container** | `#FFD7BF` | Soft orange tint for badges, chips, hover surfaces |
| **On primary** | `#FFFFFF` | Text/icons on orange CTAs |
| **On primary container** | `#5A1F00` | Text/icons on soft orange |
| **Secondary (accent yellow)** | `#F5C518` | App icon background tone, badges, highlights |
| **Secondary container** | `#FFEEB0` | Soft yellow for chips, info banners |
| **On secondary** | `#1A1300` | Text on solid yellow (yellow needs dark ink) |
| **On secondary container** | `#3A2A00` | Text on soft yellow |
| **Tertiary (warm brown)** | `#8B4A1F` | Supporting earth tone, complements orange |
| **Tertiary container** | `#FFD7BF` | Same family as primary container |
| **On tertiary** | `#FFFFFF` | |
| **On tertiary container** | `#5A1F00` | |
| **Ink (neutral dark)** | `#0F0F0F` | `onSurface`, primary body text |
| **On surface variant** | `#3A3A3A` | Muted body text |
| **Outline** | `#7A7368` | Borders against cream |
| **Outline variant** | `#D9D2C3` | Dividers, subtle borders |
| **Canvas (cream)** | `#F8F4EB` | `surface`, `background`, default screen bg |
| **Surface container lowest** | `#FFFFFF` | High-contrast cards on cream |
| **Surface container low** | `#FAF6EE` | Slightly elevated from canvas |
| **Surface container** | `#F2EDE0` | Standard card |
| **Surface container high** | `#EBE5D4` | Hover/raised |
| **Surface container highest** | `#E4DCC8` | Pressed |
| **Surface bright** | `#FBF8F1` | Brighter than canvas, near-white cream |
| **Surface dim** | `#E8E1D0` | Dimmer than canvas |
| **Surface tint** | `#FF6B1A` | Mirrors primary |
| **Surface variant** | `#EBE5D4` | Same as container high |
| **Inverse surface** | `#2A2622` | Dark warm neutral for snackbars/tooltips |
| **Inverse on surface** | `#F8F4EB` | Cream text on dark |
| **Inverse primary** | `#FFB088` | Lighter orange for use on inverse surface |

## Full token mapping — `src/constants/theme.ts`

The implementer rewrites the `Colors` object so each key has the new value below. Order in the file is preserved.

| Key | Old | New |
| --- | --- | --- |
| `primary` | `#006d37` | `#FF6B1A` |
| `primaryContainer` | `#2ecc71` | `#FFD7BF` |
| `onPrimary` | `#ffffff` | `#FFFFFF` |
| `onPrimaryContainer` | `#005027` | `#5A1F00` |
| `primaryFixed` | `#6bfe9c` | `#FFD7BF` |
| `primaryFixedDim` | `#4ae183` | `#FFB088` |
| `onPrimaryFixed` | `#00210c` | `#2B0E00` |
| `onPrimaryFixedVariant` | `#005228` | `#5A1F00` |
| `inversePrimary` | `#4ae183` | `#FFB088` |
| `secondary` | `#0051d3` | `#F5C518` |
| `secondaryContainer` | `#226afc` | `#FFEEB0` |
| `onSecondary` | `#ffffff` | `#1A1300` |
| `onSecondaryContainer` | `#fefcff` | `#3A2A00` |
| `secondaryFixed` | `#dbe1ff` | `#FFEEB0` |
| `secondaryFixedDim` | `#b3c5ff` | `#FFE07A` |
| `onSecondaryFixed` | `#00174a` | `#1A1300` |
| `onSecondaryFixedVariant` | `#003ea6` | `#3A2A00` |
| `tertiary` | `#98472a` | `#8B4A1F` |
| `tertiaryContainer` | `#ff9875` | `#FFD7BF` |
| `onTertiary` | `#ffffff` | `#FFFFFF` |
| `onTertiaryContainer` | `#772e14` | `#5A1F00` |
| `tertiaryFixed` | `#ffdbd0` | `#FFD7BF` |
| `tertiaryFixedDim` | `#ffb59d` | `#FFB088` |
| `onTertiaryFixed` | `#390c00` | `#2B0E00` |
| `error` | `#ba1a1a` | `#ba1a1a` *(unchanged)* |
| `errorContainer` | `#ffdad6` | `#ffdad6` *(unchanged)* |
| `onError` | `#ffffff` | `#ffffff` *(unchanged)* |
| `onErrorContainer` | `#93000a` | `#93000a` *(unchanged)* |
| `surface` | `#f8f9fa` | `#F8F4EB` |
| `surfaceBright` | `#f8f9fa` | `#FBF8F1` |
| `surfaceDim` | `#d9dadb` | `#E8E1D0` |
| `surfaceContainer` | `#edeeef` | `#F2EDE0` |
| `surfaceContainerLow` | `#f3f4f5` | `#FAF6EE` |
| `surfaceContainerLowest` | `#ffffff` | `#FFFFFF` |
| `surfaceContainerHigh` | `#e7e8e9` | `#EBE5D4` |
| `surfaceContainerHighest` | `#e1e3e4` | `#E4DCC8` |
| `surfaceTint` | `#006d37` | `#FF6B1A` |
| `surfaceVariant` | `#e1e3e4` | `#EBE5D4` |
| `onSurface` | `#191c1d` | `#0F0F0F` |
| `onSurfaceVariant` | `#3d4a3e` | `#3A3A3A` |
| `outline` | `#6c7b6d` | `#7A7368` |
| `outlineVariant` | `#bbcbbb` | `#D9D2C3` |
| `inverseSurface` | `#2e3132` | `#2A2622` |
| `inverseOnSurface` | `#f0f1f2` | `#F8F4EB` |
| `background` | `#f8f9fa` | `#F8F4EB` |
| `onBackground` | `#191c1d` | `#0F0F0F` |
| `emerald50` | `#ecfdf5` | `#ecfdf5` *(unchanged — status utility)* |
| `emerald600` | `#059669` | `#059669` *(unchanged — status utility)* |
| `whatsappGreen` | `#25D366` | `#25D366` *(unchanged — brand of WhatsApp)* |
| `amber400` | `#fbbf24` | `#fbbf24` *(unchanged — status utility)* |
| `gray400` | `#9ca3af` | `#9ca3af` *(unchanged — neutral utility)* |
| `gray100` | `#f3f4f6` | `#f3f4f6` *(unchanged — neutral utility)* |

`Shadows.action.shadowColor`: `#006d37` → `#FF6B1A`. All other `Shadows.*.shadowColor` entries (`#000000`) are unchanged.

`Spacing` and `Radius` are unchanged.

## Full token mapping — `tailwind.config.js`

Every kebab-cased key under `theme.extend.colors` mirrors the camelCase value above. The implementer rewrites the block as follows:

| Tailwind key | New value |
| --- | --- |
| `primary` | `#FF6B1A` |
| `primary-container` | `#FFD7BF` |
| `on-primary` | `#FFFFFF` |
| `on-primary-container` | `#5A1F00` |
| `primary-fixed` | `#FFD7BF` |
| `primary-fixed-dim` | `#FFB088` |
| `on-primary-fixed` | `#2B0E00` |
| `on-primary-fixed-variant` | `#5A1F00` |
| `inverse-primary` | `#FFB088` |
| `secondary` | `#F5C518` |
| `secondary-container` | `#FFEEB0` |
| `on-secondary` | `#1A1300` |
| `on-secondary-container` | `#3A2A00` |
| `secondary-fixed` | `#FFEEB0` |
| `secondary-fixed-dim` | `#FFE07A` |
| `on-secondary-fixed` | `#1A1300` |
| `on-secondary-fixed-variant` | `#3A2A00` |
| `tertiary` | `#8B4A1F` |
| `tertiary-container` | `#FFD7BF` |
| `on-tertiary` | `#FFFFFF` |
| `on-tertiary-container` | `#5A1F00` |
| `tertiary-fixed` | `#FFD7BF` |
| `tertiary-fixed-dim` | `#FFB088` |
| `on-tertiary-fixed` | `#2B0E00` |
| `error` | `#ba1a1a` *(unchanged)* |
| `error-container` | `#ffdad6` *(unchanged)* |
| `on-error` | `#ffffff` *(unchanged)* |
| `on-error-container` | `#93000a` *(unchanged)* |
| `surface` | `#F8F4EB` |
| `surface-bright` | `#FBF8F1` |
| `surface-dim` | `#E8E1D0` |
| `surface-container` | `#F2EDE0` |
| `surface-container-low` | `#FAF6EE` |
| `surface-container-lowest` | `#FFFFFF` |
| `surface-container-high` | `#EBE5D4` |
| `surface-container-highest` | `#E4DCC8` |
| `surface-tint` | `#FF6B1A` |
| `surface-variant` | `#EBE5D4` |
| `on-surface` | `#0F0F0F` |
| `on-surface-variant` | `#3A3A3A` |
| `outline` | `#7A7368` |
| `outline-variant` | `#D9D2C3` |
| `inverse-surface` | `#2A2622` |
| `inverse-on-surface` | `#F8F4EB` |
| `background` | `#F8F4EB` |
| `on-background` | `#0F0F0F` |

`fontFamily`, `borderRadius`, and `spacing` extensions in the Tailwind config are unchanged.

## DameRideLogo component

**Path:** `src/components/DameRideLogo.tsx`

**API:**

```ts
type DameRideLogoProps = {
  size: number;            // Sets width AND height (logo is rendered square)
  color?: string;          // Defaults to Colors.primary
};
```

**Implementation notes:**

- Use `react-native-svg` (already installed at v15.12.1). Top-level element is `<Svg width={size} height={size} viewBox="0 0 64 64" />`. Authoring inside a 64x64 viewBox keeps the math integer-friendly.
- Default `color` value: `import { Colors } from '@/src/constants/theme'; ... color = Colors.primary`.
- Visual breakdown of the mark (all filled with the `color` prop unless noted):
  1. **Body** — a rounded-rect car silhouette spanning roughly x:8→56, y:24→44, with corner radii ~10. The bottom edge sits on y=44 to leave room for the wheels and smile arc below.
  2. **Dome** — a slightly raised top arc spanning roughly x:18→46, y:14→24, formed by a `<Path>` with a smooth cubic curve into the body.
  3. **Handle / lock detail** — a small vertical capsule (width ~3, height ~6) centered horizontally at x=32, peaking above the dome around y:8→14.
  4. **Wheels** — two `<Circle>` elements, radius ~5, at roughly (20, 48) and (44, 48). Filled with the same `color`.
  5. **Smile arc** — a thin stroke `<Path>` (no fill, stroke-width ~2.5, stroke-linecap="round") describing a shallow semicircle from (22, 52) to (42, 52) dipping to ~y=56. Stroke color is the same `color`.
- The component is purely presentational. No state, no animation, no a11y label by default — the caller decides whether to wrap it in a `View accessible accessibilityLabel="DameRide"`.
- File should `export default function DameRideLogo(...)` and also be `memo`-able if the implementer prefers; not required.

**Why hand-author and not trace the PNG:** the raster is 1080x1350 RGBA and the mark is geometrically simple. A vector reconstruction lets the logo color be driven by the theme token (so dark/inverse contexts can pass a different `color`), and avoids shipping a giant inline SVG `<Path d="…">` blob produced by an autotracer.

## Hex-literal audit procedure

Run, separately, from the repo root:

```bash
rg -i -n --no-heading -tts -ttsx -tjs -tjsx '#006d37|#2ecc71|#005027|#6bfe9c|#4ae183|#0051d3|#226afc' app src components constants tailwind.config.js
```

Each match must be reviewed and either:
- Replaced with the new equivalent (per the mapping tables above), **or**
- Replaced with a token import (e.g. `Colors.primary` / `bg-primary`), **or**
- Left alone if it's not actually brand-coded (rare; should be documented in the PR description).

Then run a broader sweep for any other bare hex literal in those directories to catch brand-coded values that don't match the legacy seven:

```bash
rg -n --no-heading -tts -ttsx '#[0-9a-fA-F]{6}\b' app src components
```

The implementer reviews each match individually. **Do not** use `replace_all` on this sweep. Non-brand literals (third-party logos, deliberately fixed status indicator tints not represented by `error*`, map style hex strings) are left as-is and listed in the PR description.

## Alternatives considered

- **Autotrace the PNG into SVG.** Rejected — produces an opaque `<Path>` that can't easily be themed, and the mark is simple enough to author by hand.
- **Single source of truth via codegen** (e.g. derive Tailwind colors from `src/constants/theme.ts` at build time). Tempting but out of scope; would change the build pipeline and is a separate, larger refactor.
- **Migrate hex literals via a blanket sed.** Rejected — too risky; non-brand hex codes (e.g. third-party brand color in a "Sign in with X" button) would be silently rewritten.
- **Delete the duplicate root `constants/theme.ts`.** Out of scope for this change because `hooks/use-theme-color.ts` still imports it. A separate cleanup change should delete both files if `useThemeColor` is unused.
