# Spec Delta: Branding — Orange/Cream Visual Identity

## ADDED Requirements

### Requirement: The brand palette MUST be canonical and centrally defined

The application SHALL treat the orange/cream brand palette as the single source of visual identity. The palette MUST be defined in two locations that stay in lockstep: the TypeScript `Colors` object in `src/constants/theme.ts` and the `theme.extend.colors` block in `tailwind.config.js`. Every semantic token name (e.g. `primary`, `primaryContainer`, `onPrimary`, `surface`, `onSurface`, `outline`, `inversePrimary`) MUST have the same hex value in both files.

The primary brand color MUST be `#FF6B1A` (orange). The secondary brand color MUST be `#F5C518` (yellow). The default neutral surface (`surface`, `background`) MUST be `#F8F4EB` (cream). The default ink (`onSurface`, `onBackground`) MUST be `#0F0F0F`.

#### Scenario: Primary token equals canonical orange

- **GIVEN** the codebase after the rebrand has merged
- **WHEN** a developer reads `Colors.primary` from `src/constants/theme.ts`
- **THEN** the value is the string `'#FF6B1A'`
- **AND** the same value `#FF6B1A` appears under `theme.extend.colors.primary` in `tailwind.config.js`

#### Scenario: Secondary token equals canonical yellow

- **GIVEN** the codebase after the rebrand has merged
- **WHEN** a developer reads `Colors.secondary` from `src/constants/theme.ts`
- **THEN** the value is the string `'#F5C518'`
- **AND** the same value `#F5C518` appears under `theme.extend.colors.secondary` in `tailwind.config.js`

#### Scenario: Surface and background equal canonical cream

- **GIVEN** the codebase after the rebrand has merged
- **WHEN** a developer reads `Colors.surface`, `Colors.background`, or the Tailwind `surface`/`background` keys
- **THEN** every value is `#F8F4EB`

### Requirement: Legacy brand hex codes MUST NOT appear in source

The codebase SHALL contain zero string occurrences of the following legacy brand hex codes (case-insensitive) within `app/`, `src/`, `components/`, `constants/`, and `tailwind.config.js`: `#006d37`, `#2ecc71`, `#005027`, `#6bfe9c`, `#4ae183`, `#0051d3`, `#226afc`. Status colors and non-brand hex literals (third-party brand colors, map style strings, deliberately fixed utility tints) are outside this requirement.

#### Scenario: Grep across source for legacy brand hex returns zero matches

- **GIVEN** the codebase after the rebrand has merged
- **WHEN** the implementer runs `rg -i '#006d37|#2ecc71|#005027|#6bfe9c|#4ae183|#0051d3|#226afc' app src components constants tailwind.config.js`
- **THEN** the command exits with no matches

### Requirement: Action-level shadow MUST tint with the brand color

The `Shadows.action.shadowColor` exported from `src/constants/theme.ts` SHALL equal the primary brand color `#FF6B1A`. Other entries in `Shadows` (`surface`, `sm`, `bottomBar`) MUST retain their pre-change `shadowColor` of `#000000`.

#### Scenario: Primary CTA elevation tints orange

- **GIVEN** a primary action button rendered with `Shadows.action`
- **WHEN** the button is rendered on an iOS simulator
- **THEN** its shadow is tinted orange, not green or black

### Requirement: Status, utility, and neutral tokens MUST be preserved

The following keys in `Colors` (from `src/constants/theme.ts`) and their kebab-cased Tailwind counterparts MUST retain their pre-change values: `error`, `errorContainer`, `onError`, `onErrorContainer`, `whatsappGreen`, `amber400`, `emerald50`, `emerald600`, `gray100`, `gray400`. Status indicators (validation errors, WhatsApp share affordances, amber warnings) continue to render at the same hex they did before the rebrand.

#### Scenario: Error token is preserved

- **GIVEN** the codebase after the rebrand has merged
- **WHEN** a developer reads `Colors.error`
- **THEN** the value is `'#ba1a1a'`
- **AND** the Tailwind `error` key is also `'#ba1a1a'`

#### Scenario: WhatsApp share button color is preserved

- **GIVEN** the codebase after the rebrand has merged
- **WHEN** a developer reads `Colors.whatsappGreen`
- **THEN** the value is `'#25D366'`

### Requirement: The DameRide logo MUST be available as a themeable SVG component

A new component at `src/components/DameRideLogo.tsx` SHALL exist and SHALL be built with `react-native-svg` primitives (no inline raster, no autotraced `<Path d>` blob). The component MUST accept a required `size: number` prop and an optional `color?: string` prop. When `color` is omitted, the component MUST default to `Colors.primary` imported from `src/constants/theme.ts`. The component MUST render a recognizable car-with-smile DameRide mark at any size between 16 px and 256 px.

The raster file `assets/images/dame-ride-logo.png` MUST remain in the repository to serve as the source for app-icon, splash, and favicon asset slots in a separate follow-up change.

#### Scenario: Default color falls back to brand primary

- **GIVEN** the rebrand has merged
- **WHEN** a screen renders `<DameRideLogo size={48} />` with no `color` prop
- **THEN** the visible mark is tinted `#FF6B1A`

#### Scenario: Explicit color prop overrides the default

- **GIVEN** the rebrand has merged
- **WHEN** a screen renders `<DameRideLogo size={48} color="#FFFFFF" />` over a dark surface
- **THEN** the visible mark is tinted white

#### Scenario: Size prop sets both width and height

- **GIVEN** the rebrand has merged
- **WHEN** a screen renders `<DameRideLogo size={96} />`
- **THEN** the rendered SVG has both width and height equal to 96, with the mark scaled to fit

### Requirement: Inline raster renders of the logo MUST be replaced by the SVG component

For every place in `app/`, `src/`, or `components/` that previously rendered `assets/images/dame-ride-logo.png` inline as a visible logo (e.g. via `<Image source={require('.../dame-ride-logo.png')} />`), the source MUST be updated to render `<DameRideLogo size={…} />` instead. Asset-manifest references in `app.config.js`, `app.json`, splash-screen configuration, and favicon configuration MUST NOT be modified.

If no inline raster usages exist at implementation time, this requirement is satisfied vacuously and the implementer MUST state so in the PR description.

#### Scenario: No raster logo renders remain in source

- **GIVEN** the rebrand has merged
- **WHEN** the implementer runs `rg "dame-ride-logo" app src components`
- **THEN** the only matches (if any) are references inside string literals consumed by asset configuration, not inside JSX `source` props

### Requirement: App icon, splash, and favicon raster assets MUST NOT change in this rebrand

The raster files used for app icon, splash screen, adaptive icon foreground, and favicon SHALL remain byte-identical to their pre-change versions. Specifically, `assets/images/dame-ride-logo.png`, `assets/images/icon.png`, `assets/images/android-icon-foreground.png`, `assets/images/splash-icon.png`, and any favicon raster under `assets/` MUST NOT be modified, replaced, or deleted by this change. Regenerating these assets is explicitly tracked as a separate follow-up change.

#### Scenario: Icon assets are unchanged

- **GIVEN** the rebrand has merged
- **WHEN** the implementer runs `git status assets/images/`
- **THEN** none of `dame-ride-logo.png`, `icon.png`, `android-icon-foreground.png`, or `splash-icon.png` show as modified

### Requirement: Body text on cream MUST meet WCAG AA contrast

Body text rendered with `Colors.onSurface` on `Colors.surface` (or `Colors.background`) MUST achieve a contrast ratio of at least 4.5:1 as defined by WCAG 2.1 AA. Secondary text rendered with `Colors.onSurfaceVariant` on `Colors.surface` MUST also achieve at least 4.5:1.

#### Scenario: Primary body text contrast

- **GIVEN** `Colors.onSurface = '#0F0F0F'` and `Colors.surface = '#F8F4EB'`
- **WHEN** the contrast ratio is computed per WCAG 2.1
- **THEN** the ratio is at least 4.5:1

#### Scenario: Secondary body text contrast

- **GIVEN** `Colors.onSurfaceVariant` and `Colors.surface` from the rebranded theme
- **WHEN** the contrast ratio is computed per WCAG 2.1
- **THEN** the ratio is at least 4.5:1
