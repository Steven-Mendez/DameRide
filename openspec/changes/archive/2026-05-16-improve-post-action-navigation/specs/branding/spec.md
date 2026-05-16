# Spec Delta: Branding — Search-Submit Button Primary Treatment

This delta extends the existing `branding` capability (`openspec/specs/branding/spec.md`). It does not modify any existing requirement in that capability (those govern `<DameRideLogo>` and, via `fix-ride-cta-contrast`, the ride card CTA). It adds one constraint on the Buscar tab's search-submit button so it expresses the brand's solid primary color and reads as an active button, consistent with the ride card CTA correction. No theme tokens are added, changed, or removed; `src/components/Button.tsx` is not modified — only a `variant` prop value at the call site changes.

## ADDED Requirements

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
