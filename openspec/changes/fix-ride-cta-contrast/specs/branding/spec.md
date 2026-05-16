# Spec Delta: Branding — Ride Card Primary CTA Contrast

This delta extends the existing `branding` capability (`openspec/specs/branding/spec.md`). It does not modify any existing requirement in that capability (those govern `<DameRideLogo>`); it only adds a constraint on how the ride card's primary call-to-action expresses the brand's primary color so it reads as an active button. No theme tokens are added, changed, or removed by this delta.

## ADDED Requirements

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
