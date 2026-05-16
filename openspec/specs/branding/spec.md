# branding Specification

## Purpose
TBD - created by archiving change replace-png-logo-with-svg. Update Purpose after archive.
## Requirements
### Requirement: `<DameRideLogo>` MUST render as inline SVG, not as a `<Image>` over a PNG

`src/components/DameRideLogo.tsx` SHALL render the brand mark using `Svg`, `Path`, `Circle`, `Mask`, and `Rect` primitives from `react-native-svg`. The component MUST NOT import `Image` from `react-native`, MUST NOT call `require('@/assets/images/dame-ride-logo.png')` (or any other PNG `require`), and MUST NOT use the `tintColor` style property. `react-native-svg` is already declared at `^15.12.1` in `package.json`; no dependency changes are part of this requirement.

#### Scenario: Source no longer references the PNG

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "dame-ride-logo" src`
- **THEN** the command returns no matches
- **AND** `rg -n "tintColor" src/components/DameRideLogo.tsx` returns no matches
- **AND** `rg -n "from 'react-native'" src/components/DameRideLogo.tsx` returns no matches involving `Image`

#### Scenario: Source imports the SVG primitives

- **GIVEN** the change has merged
- **WHEN** the implementer reads `src/components/DameRideLogo.tsx`
- **THEN** the file imports `Svg`, `Path`, `Circle`, `Mask`, and `Rect` (and optionally `G`) from `'react-native-svg'`

### Requirement: The public API of `<DameRideLogo>` MUST be preserved byte-for-byte

The exported props type of `DameRideLogo` SHALL be exactly `{ size: number; color?: string; accessibilityLabel?: string }`. No props are added, removed, renamed, or re-typed. `color` defaults to `Colors.primary`. The default export name remains `DameRideLogo`. The file path remains `src/components/DameRideLogo.tsx`.

#### Scenario: Consumers remain unmodified

- **GIVEN** the change has merged
- **WHEN** the implementer runs `git diff --name-only <base>..HEAD -- app src`
- **THEN** the output does NOT include `app/(auth)/login.tsx`
- **AND** does NOT include `app/index.tsx`
- **AND** does NOT include `app/_layout.tsx`
- **AND** does NOT include `src/components/BrandSplash.tsx`

#### Scenario: Type signature is preserved

- **GIVEN** the change has merged
- **WHEN** the implementer reads the exported props type in `src/components/DameRideLogo.tsx`
- **THEN** the type has exactly three fields: `size: number`, `color?: string`, `accessibilityLabel?: string`
- **AND** no field has been added (no `cutoutColor`, no `style`, no `testID`, no `variant`)

#### Scenario: TypeScript compiles against unchanged consumers

- **GIVEN** the change has merged
- **WHEN** the implementer runs `npx tsc --noEmit`
- **THEN** the command exits with code 0

### Requirement: The SVG `<Svg>` root MUST use a square viewBox of `87 221 900 900`

The `<Svg>` element rendered by `<DameRideLogo>` SHALL have `width={size}`, `height={size}`, and `viewBox="87 221 900 900"`. The original user-supplied SVG used a `1080 × 1350` viewBox with a black `<rect>` backdrop. That viewBox MUST NOT be carried through unchanged because the component is rendered as a square (`size × size`) and a `1080 × 1350` viewBox inside a square `<Svg>` would either vertically squish the geometry or float it in empty canvas.

The artwork bounding box in `assets/images/logo.svg` is approximately x `126`→`948` (center x ≈ `537`) and y `302` (dome top) → `~1040` (smile bottom) (center y ≈ `671`). A `900 × 900` square centered on `(537, 671)` is derived as `minX = 537 − 450 = 87`, `minY = 671 − 450 = 221`, giving `viewBox="87 221 900 900"` with ~39px horizontal and ~81px vertical padding around the art so the mark renders centered, not top-heavy. (A prior revision of this spec locked `0 280 1080 1080`; that window started at the far-left edge and underestimated the smile's bottom edge as `~948`, pushing the mark to the top-left with a large dead band below. That value is superseded.)

#### Scenario: Square viewBox is used

- **GIVEN** the change has merged
- **WHEN** a developer reads the rendered `<Svg>` element
- **THEN** its `viewBox` prop equals the string `"87 221 900 900"`
- **AND** its `width` prop equals the `size` prop
- **AND** its `height` prop equals the `size` prop

#### Scenario: The superseded viewBox values are not present

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "1350" src/components/DameRideLogo.tsx`
- **THEN** the command returns no matches
- **AND** `rg -n "0 280 1080 1080" src/components/DameRideLogo.tsx` returns no matches

### Requirement: The logo MUST render on a transparent background

`<DameRideLogo>` SHALL NOT render any background fill (no `<Rect>` covering the viewBox with a non-transparent fill outside the mask, no surface-color polygon behind the painted geometry). The component composes onto whatever surface the consumer provides. The original source SVG's `<rect width="1080" height="1350" fill="#000"/>` backdrop MUST be omitted entirely.

#### Scenario: No opaque background rect

- **GIVEN** the change has merged
- **WHEN** the implementer reads `src/components/DameRideLogo.tsx`
- **THEN** there is no `<Rect>` element rendered as a sibling of the painted shapes (rects MAY appear inside the `<Mask>` as the mask's "keep" base, but NOT outside it)
- **AND** `rg -n 'fill="#000"' src/components/DameRideLogo.tsx` returns matches only for shapes inside the `<Mask>` element (the cutout subtractors)

### Requirement: Cutouts MUST be rendered as true transparency via a `<Mask>` applied only to the body and dome

The three subtractive shapes from the source SVG — the window, the left wheel arch, and the right wheel arch — SHALL render as transparent holes in the car body and dome on any background color. This MUST be implemented via a `<Mask>` element whose painted base is a full-canvas white `<Rect>` and whose three black-filled child paths subtract those three cutout regions.

The mask MUST apply only to the shapes the cutouts are meant to subtract. The required render structure is:

1. A `<Mask id="dameRideCutouts">` with `maskUnits="userSpaceOnUse"` and bounds `x="0" y="0" width="1080" height="1350"` (covering the full source canvas so the mask is independent of the viewBox). Its first child is a white-filled `<Rect x="0" y="0" width="1080" height="1350">` base. Its remaining children are exactly three black-filled `<Path>` elements: the window, the left wheel arch, and the right wheel arch (coordinates byte-identical to `assets/images/logo.svg`).
2. A single `<G mask="url(#dameRideCutouts)">` group containing exactly two painted shapes filled with `color`: the car body `<Path>` and the dome `<Path>`.
3. The two wheel `<Circle>` elements and the smile `<Path>`, rendered AFTER the masked group as unmasked siblings, each filled with `color`.

This reproduces the source SVG's exact paint order — body → dome → window/arch cutouts → left wheel → right wheel → smile — where the white wheel circles are painted on top of the black arch holes so each wheel reads as a solid circle with only a thin background "wheel well" crescent between wheel and body. The wheel `<Circle>`s and the smile `<Path>` MUST NOT be descendants of the masked `<G>`; if they were, the wheel-arch cutouts would subtract the wheels and they would render as crescents (the defect this requirement corrects). The smile has no separate inner-cutout shape — it is a single closed path painted directly with `color`.

The cutouts MUST NOT be implemented by painting them with a surface color (no `cutoutColor` prop, no hard-coded `Colors.background` fill). The reason: `<DameRideLogo>` is consumed against at least three different surface colors today (login cream, `<BrandSplash>` cream, white in `app/index.tsx` route gating UI) and the public API does not expose a surface-color prop. Mask-based transparency is the only approach that stays correct against arbitrary surfaces without expanding the API.

#### Scenario: Mask element exists with the documented id and full-canvas bounds

- **GIVEN** the change has merged
- **WHEN** the implementer reads `src/components/DameRideLogo.tsx`
- **THEN** the file contains a `<Mask` element with `id="dameRideCutouts"`, `maskUnits="userSpaceOnUse"`, `x="0"`, `y="0"`, `width="1080"`, and `height="1350"`
- **AND** its base child is a white-filled `<Rect>` with `x="0"`, `y="0"`, `width="1080"`, `height="1350"`
- **AND** it contains exactly three black-filled cutout `<Path>` elements (window, left wheel arch, right wheel arch)

#### Scenario: Only the body and dome are masked

- **GIVEN** the change has merged
- **WHEN** the implementer reads `src/components/DameRideLogo.tsx`
- **THEN** there is exactly one `<G>` element with `mask="url(#dameRideCutouts)"`
- **AND** that group's only painted children are the car body `<Path>` and the dome `<Path>`
- **AND** the two wheel `<Circle>` elements are NOT descendants of that group
- **AND** the smile `<Path>` is NOT a descendant of that group
- **AND** the two wheel `<Circle>` elements and the smile `<Path>` appear AFTER (as later siblings of) the masked `<G>` and are not themselves masked

#### Scenario: Cutouts render transparent and wheels render solid

- **GIVEN** the change has merged
- **AND** the app is running on iOS or Android
- **WHEN** `<DameRideLogo size={120} accessibilityLabel="DameRide" />` is rendered inside `<BrandSplash>` (cream background)
- **THEN** the window and both wheel arches show the cream surface through them (not orange, not black)
- **AND** each wheel renders as a SOLID `color` circle sitting on top of its arch — not a crescent — with only a thin transparent "wheel well" crescent of the surface showing between the wheel and the body
- **AND** the smile renders as a solid `color` shape
- **AND** when the same component is mounted on a `#FFFFFF` white surface, the window and arches show white through them

#### Scenario: No `cutoutColor` prop or constant exists

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "cutoutColor" src`
- **THEN** the command returns no matches

### Requirement: The smile path's malformed token MUST be corrected to `764 900`

The user-provided source SVG contains the smile path `M 381 873 A 237 237 0 0 0 316 900 A 249 249 0 0 0 764900 A 237 237 0 0 1 699 873 A 179 179 0 0 1 381 873 Z`. The token `764900` is a malformed concatenation of two numbers and SHALL be transcribed as `764 900` (x=764, y=900). The corrected smile path that MUST be encoded in the component is:

```
M 381 873 A 237 237 0 0 0 316 900 A 249 249 0 0 0 764 900 A 237 237 0 0 1 699 873 A 179 179 0 0 1 381 873 Z
```

#### Scenario: Malformed token does not appear in source

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "764900" src`
- **THEN** the command returns no matches

#### Scenario: Corrected smile path is present

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "764 900" src/components/DameRideLogo.tsx`
- **THEN** the command returns at least one match

### Requirement: Accessibility behavior MUST match the prior PNG component

When `accessibilityLabel` is provided, the `<Svg>` root SHALL receive `accessible={true}`, `accessibilityRole="image"`, and `accessibilityLabel={accessibilityLabel}`. When `accessibilityLabel` is `undefined`, the `<Svg>` root MUST NOT be exposed as an accessibility node (`accessible={false}` and the role/label are omitted). This matches the prior PNG component's `accessible={accessibilityLabel ? true : false}` behavior.

#### Scenario: Label provided announces correctly

- **GIVEN** the change has merged
- **WHEN** `<DameRideLogo size={120} accessibilityLabel="DameRide" />` is rendered
- **THEN** the `<Svg>` element has `accessible={true}`
- **AND** has `accessibilityRole="image"`
- **AND** has `accessibilityLabel="DameRide"`

#### Scenario: No label means no a11y exposure

- **GIVEN** the change has merged
- **WHEN** `<DameRideLogo size={120} />` is rendered (no `accessibilityLabel`)
- **THEN** the `<Svg>` element is not exposed as an accessibility node (either `accessible={false}` or the prop is omitted such that the platform default is non-accessible)

### Requirement: The PNG asset `assets/images/dame-ride-logo.png` MUST be deleted

Once `<DameRideLogo>` no longer references `assets/images/dame-ride-logo.png` and no other file in `app/`, `src/`, or `components/` references the asset name, the file SHALL be deleted from disk. Deletion is gated on the grep precondition — it MUST NOT happen before the rewrite is complete and the grep is clean. Historical references to the string `dame-ride-logo` inside `openspec/changes/` are frozen proposal text and do not count as live references.

#### Scenario: Asset is removed from disk

- **GIVEN** the change has merged
- **WHEN** the implementer runs `ls assets/images/dame-ride-logo.png`
- **THEN** the command exits non-zero (file does not exist)

#### Scenario: No live references remain to the asset name

- **GIVEN** the change has merged
- **WHEN** the implementer runs `rg -n "dame-ride-logo" app src components`
- **THEN** the command returns no matches

#### Scenario: No other raster asset is touched

- **GIVEN** the change has merged
- **WHEN** the implementer runs `git status assets/images/`
- **THEN** `splash-icon.png`, `icon.png`, `android-icon-foreground.png`, and `hero_illustration.png` do not appear as modified or deleted
- **AND** only `dame-ride-logo.png` is shown as deleted

### Requirement: The ride card primary CTA MUST use the solid brand-primary treatment, not the muted primary-container treatment

The primary call-to-action in `src/components/RideCard.tsx` — the `<TouchableOpacity>` rendered under the `{/* CTA */}` comment whose label is `actionLabel` (default `"Ver detalles y reservar"`) — SHALL render with a solid brand-orange fill and a white label so it reads as an active, prominent primary button consistent with every other primary CTA in the app.

Specifically:

- The CTA `<TouchableOpacity>`'s `className` MUST use `bg-primary` (which maps to `Colors.primary` = `#FF6B1A`) for its surface. It MUST NOT use `bg-primary-container` (`Colors.primaryContainer` = `#FFD7BF`).
- The CTA label `<Text>`'s `className` MUST use `text-on-primary` (which maps to `Colors.onPrimary` = `#FFFFFF`). It MUST NOT use `text-on-primary-container` (`Colors.onPrimaryContainer` = `#5A1F00`).

This pairing MUST match the primary-button treatment already used by `app/(auth)/login.tsx` ("Crear cuenta" / "Iniciar sesion") and by `src/components/Button.tsx` `variant="primary"`, so the ride card CTA is visually indistinguishable from those buttons in terms of activeness/prominence.

This requirement governs color only. The CTA's existing size/shape/layout classes (`w-full`, `py-3`, `rounded-xl`, `items-center`, `mt-1`), its `activeOpacity={0.7}`, its `onPress` (which navigates to `/ride/${ride.id}`), and its label content (`actionLabel`) MUST be preserved unchanged. The CTA has no `disabled` or loading state today and this requirement neither adds one nor permits one to be added.

This requirement MUST be satisfied without modifying `src/constants/theme.ts` or `tailwind.config.js`. The values of `Colors.primary` and `Colors.primaryContainer` are unchanged globally; `primary-container` remains a valid token for non-primary-action surfaces elsewhere in the app.

#### Scenario: The CTA surface uses the solid brand primary

- **GIVEN** the change has merged
- **WHEN** a developer runs `rg -n "bg-primary-container" src/components/RideCard.tsx`
- **THEN** the command returns no matches
- **AND** running `rg -n "w-full py-3 bg-primary rounded-xl items-center mt-1" src/components/RideCard.tsx` returns exactly one match

#### Scenario: The CTA label uses white on-primary

- **GIVEN** the change has merged
- **WHEN** a developer runs `rg -n "text-on-primary-container" src/components/RideCard.tsx`
- **THEN** the command returns no matches
- **AND** the CTA label `<Text>`'s className is `font-jakarta-bold text-sm text-on-primary`

#### Scenario: The CTA renders as an active button on the Buscar tab

- **GIVEN** the change has merged
- **AND** the app is running and the "Buscar" tab is showing at least one `<RideCard>`
- **WHEN** a tester looks at the "Ver detalles y reservar" button
- **THEN** the button has a solid `#FF6B1A` fill with a white label
- **AND** it is visually indistinguishable in activeness/prominence from the "Iniciar sesion" / "Crear cuenta" buttons on the login screen
- **AND** it no longer reads as a disabled or inactive button

#### Scenario: Behavior, layout, and tokens are unchanged

- **GIVEN** the change has merged
- **WHEN** a developer reads the CTA block in `src/components/RideCard.tsx`
- **THEN** the `<TouchableOpacity>` still has `activeOpacity={0.7}` and `onPress={() => router.push(`/ride/${ride.id}`)}`
- **AND** the layout classes `w-full`, `py-3`, `rounded-xl`, `items-center`, and `mt-1` are all still present on the `<TouchableOpacity>`
- **AND** the label still renders `actionLabel` (default `"Ver detalles y reservar"`)
- **AND** `git diff src/constants/theme.ts tailwind.config.js` is empty

#### Scenario: No disabled state is introduced

- **GIVEN** the change has merged
- **WHEN** a developer reads `src/components/RideCard.tsx`
- **THEN** the CTA `<TouchableOpacity>` has no `disabled` prop and no conditional/loading styling
- **AND** `RideCard`'s props type exposes no `disabled` prop

> **NOTE (out of scope, logged for future palette-consistency awareness):** `app/index.tsx` also styles its "Buscar viaje" / "Publicar viaje" CTAs (lines ~86–108) with `bg-primary-container` / `bg-secondary-container`, which would exhibit the same "looks disabled" issue. Those are deliberately **not** changed by this delta because `app/index.tsx` is currently an obscured placeholder behind the splash (per the recently shipped navigator fix) and is not user-visible in the normal flow. This is recorded so a reviewer does not treat `index.tsx` as an oversight; a future change may align it for palette consistency if that screen becomes user-visible again.

### Requirement: The Buscar search-submit button MUST use the solid primary variant, not the muted primary-container variant

The search-submit `<Button>` in `app/(tabs)/buscar.tsx` — the one whose `title` is `pickupPoint && destinationPoint ? 'Ver viajes' : 'Ver todos los viajes'` and whose `onPress` is `handleSearch` — SHALL be rendered with `variant="primary"`. It MUST NOT use `variant="primary-container"`.

`variant="primary"` resolves to the solid brand-orange surface (`bg-primary` → `Colors.primary` = `#FF6B1A`) with white content (`text-on-primary` → `Colors.onPrimary` = `#FFFFFF`), matching the primary-button treatment already used by `app/(auth)/login.tsx` ("Crear cuenta" / "Iniciar sesion"), by `src/components/Button.tsx` `variant="primary"`, and by the `<RideCard>` CTA (per the `fix-ride-cta-contrast` change). The button MUST be visually indistinguishable in activeness/prominence from those buttons and MUST NOT read as a disabled or inactive button.

No other prop on this button changes. Specifically the icon prop MUST remain `icon={<Search size={20} color="#ffffff" />}` — the hard-coded white icon color was nearly invisible on the pale `primary-container` fill but is correct on the solid `#FF6B1A` fill, so it renders as a visible white icon. `title`, `onPress={handleSearch}`, and `loading={loading}` are unchanged.

This requirement governs the `variant` value only. It MUST be satisfied without modifying `src/components/Button.tsx`, `src/constants/theme.ts`, or `tailwind.config.js`. `primary` is an existing `<Button>` variant and `primary-container` remains a valid variant for non-primary surfaces elsewhere in the app.

#### Scenario: The search button uses the primary variant

- **GIVEN** the change has merged
- **WHEN** a developer reads the search-submit `<Button>` in `app/(tabs)/buscar.tsx`
- **THEN** its `variant` prop is `"primary"`
- **AND** the substring `variant="primary-container"` does not appear on that button
- **AND** its `icon` prop is still `<Search size={20} color="#ffffff" />`
- **AND** its `title`, `onPress={handleSearch}`, and `loading={loading}` props are unchanged

#### Scenario: The search button renders as an active button on the Buscar tab

- **GIVEN** the change has merged
- **AND** the app is running and the "Buscar" tab is showing
- **WHEN** a tester looks at the "Ver viajes" / "Ver todos los viajes" button
- **THEN** the button has a solid `#FF6B1A` fill with a clearly visible white label and a visible white search icon
- **AND** it is visually indistinguishable in activeness/prominence from the "Iniciar sesion" / "Crear cuenta" buttons on the login screen
- **AND** it no longer reads as a disabled or inactive button

#### Scenario: No component or token change

- **GIVEN** the change has merged
- **WHEN** a developer runs `git diff src/components/Button.tsx src/constants/theme.ts tailwind.config.js`
- **THEN** the diff is empty

> **NOTE (out of scope, logged for future palette-consistency awareness):** `app/index.tsx` also styles its "Buscar viaje" / "Publicar viaje" CTAs with `bg-primary-container` / `bg-secondary-container`, which exhibit the same "looks disabled" issue. Those are deliberately **not** changed here because `app/index.tsx` is currently an obscured placeholder behind the brand splash (per the shipped `fix-onboarding-navigator-race` change) and is not user-visible in the normal flow. This is recorded — consistent with the same NOTE in the `fix-ride-cta-contrast` branding delta — so a reviewer does not treat `index.tsx` as an oversight; a future change may align it if that screen becomes user-visible again.

