# Spec Delta: Branding — Wire the Brand Logo Across User-Facing Surfaces

This delta extends the `branding` capability established by the `rebrand-orange-palette` change. It does not modify or remove any existing requirements from that change; it only adds new ones that govern where and how `<DameRideLogo>` is rendered.

## ADDED Requirements

### Requirement: The login screen MUST render the brand logo as its hero element

The login screen at `app/(auth)/login.tsx` SHALL render `<DameRideLogo>` as the primary visual hero element above the wordmark and tagline. The screen MUST NOT render the legacy raster `assets/images/hero_illustration.png` (or any other off-brand hero image) anywhere in its tree. `<DameRideLogo>` MUST be rendered with an `accessibilityLabel` of `"DameRide"` and a `size` between 96 px and 200 px inclusive, chosen by the implementer to read balanced against the existing wordmark and tagline.

#### Scenario: Login imports and renders the SVG logo

- **GIVEN** the change has merged
- **WHEN** a developer reads `app/(auth)/login.tsx`
- **THEN** the file imports `DameRideLogo` from `@/src/components/DameRideLogo`
- **AND** the file contains a `<DameRideLogo` JSX element with an `accessibilityLabel="DameRide"` prop and a numeric `size` prop in `[96, 200]`

#### Scenario: Login no longer references the legacy hero raster

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "hero_illustration" app/\(auth\)/login.tsx`
- **THEN** the command returns no matches

#### Scenario: Spanish UI copy is preserved on the login screen

- **GIVEN** the change has merged
- **WHEN** a developer reads the visible strings in `app/(auth)/login.tsx`
- **THEN** `"Comparte tu ruta, ahorra dinero y viaja acompañado."`, `"Crear cuenta"`, `"o inicia con correo"`, `"Correo electrónico"`, `"Contraseña"`, and `"Iniciar sesion"` all appear verbatim as they did before the change

### Requirement: The legacy hero raster MUST NOT be referenced anywhere in source

The string `hero_illustration` SHALL NOT appear in any file under `app/`, `src/`, or `components/`. The raster file `assets/images/hero_illustration.png` itself MUST remain on disk so a separate follow-up change can delete it after a final unused-asset audit.

#### Scenario: Grep across source returns no hero illustration references

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "hero_illustration" app src components`
- **THEN** the command exits with no matches

#### Scenario: The raster file is untouched on disk

- **GIVEN** the change has merged
- **WHEN** the implementer runs `git status assets/images/`
- **THEN** `hero_illustration.png` does not appear as modified or deleted

### Requirement: A `<BrandSplash>` component MUST exist and serve as the in-app loading splash

A new component at `src/components/BrandSplash.tsx` SHALL exist. It MUST render a full-screen view with a background equal to `Colors.background`, a centered `<DameRideLogo size={120} accessibilityLabel="DameRide" />`, and a `"DameRide"` wordmark `<Text>` directly beneath the logo styled with `Colors.primary` and the project's Jakarta extrabold font family. The component MUST take no required props and MUST accept an optional `subtitle?: string` prop. When `subtitle` is omitted, no subtitle is rendered. When `subtitle` is provided, it is rendered beneath the wordmark in `Colors.onSurfaceVariant`. The component MUST NOT render a spinner or any animation.

#### Scenario: `<BrandSplash>` renders with no props

- **GIVEN** the change has merged
- **WHEN** a screen mounts `<BrandSplash />`
- **THEN** the rendered view fills the screen
- **AND** its background is `Colors.background` (`#F8F4EB`)
- **AND** it contains a `<DameRideLogo>` with `size={120}` and `accessibilityLabel="DameRide"`
- **AND** it contains a `"DameRide"` text node in `Colors.primary`
- **AND** no spinner is rendered
- **AND** no subtitle text is rendered

#### Scenario: `<BrandSplash subtitle>` renders the subtitle

- **GIVEN** the change has merged
- **WHEN** a screen mounts `<BrandSplash subtitle="Cargando…" />`
- **THEN** the rendered tree contains the string `"Cargando…"` beneath the wordmark in `Colors.onSurfaceVariant`

### Requirement: The root layout MUST render `<BrandSplash>` during auth bootstrap

`app/_layout.tsx`'s `RootLayoutNav` SHALL render `<BrandSplash />` (and only `<BrandSplash />`) whenever `loading || profileLoading` from `useAuth()` is `true`. The `<Stack>` MUST NOT be mounted in that state. The early return MUST happen after the existing `if (!fontsLoaded) return null;` guard in `RootLayout`, so `<BrandSplash>` only renders when the Jakarta font family is available.

#### Scenario: Auth bootstrap shows the branded splash

- **GIVEN** the change has merged
- **AND** the user has cold-launched the app
- **AND** fonts have finished loading
- **WHEN** `useAuth()` reports `loading: true` or `profileLoading: true`
- **THEN** the rendered tree contains `<BrandSplash />`
- **AND** the rendered tree does NOT contain `<Stack>`

#### Scenario: Auth resolved hands off to the navigation stack

- **GIVEN** the change has merged
- **WHEN** `useAuth()` reports `loading: false` and `profileLoading: false`
- **THEN** the rendered tree contains `<Stack>`
- **AND** the rendered tree does NOT contain `<BrandSplash>`

#### Scenario: Pre-font state is unchanged

- **GIVEN** the change has merged
- **WHEN** `useFonts(...)` has not yet returned `fontsLoaded: true`
- **THEN** `RootLayout` returns `null` (unchanged from the pre-change behavior)
- **AND** `<BrandSplash>` is NOT mounted

### Requirement: The native splash background MUST be the brand cream

In `app.config.js`, the `expo-splash-screen` plugin's `backgroundColor` SHALL equal `'#F8F4EB'`. The plugin's `image` field MUST remain `'./assets/images/splash-icon.png'` and the `imageWidth` and `resizeMode` fields MUST remain unchanged from their pre-change values. The plugin's `dark.backgroundColor` field MUST remain unchanged at `'#000000'` (the project has no documented dark-mode brand specification, so dark-mode native splash work is deferred).

The native splash PNG raster (`assets/images/splash-icon.png`) MUST NOT be regenerated, replaced, or otherwise modified by this change. A separate follow-up change is responsible for regenerating the raster against the new palette.

#### Scenario: Native splash background equals brand cream

- **GIVEN** the change has merged
- **WHEN** a developer reads the `expo-splash-screen` plugin entry in `app.config.js`
- **THEN** its `backgroundColor` is the string `'#F8F4EB'`

#### Scenario: Native splash image asset is unchanged

- **GIVEN** the change has merged
- **WHEN** the implementer runs `git status assets/images/splash-icon.png`
- **THEN** the file does not appear as modified
- **AND** the `image` value in `app.config.js` is still `'./assets/images/splash-icon.png'`

#### Scenario: Native splash dark-mode entry is untouched

- **GIVEN** the change has merged
- **WHEN** a developer reads the `expo-splash-screen` plugin entry in `app.config.js`
- **THEN** the `dark.backgroundColor` is `'#000000'` (unchanged)
