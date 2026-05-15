# Spec Delta: Auth — Login Hero Spacing

This delta refines the layout of the existing login screen (`app/(auth)/login.tsx`) introduced by prior auth and branding changes. It does not modify any existing requirements from `wire-brand-logo-everywhere` (which mandated the logo's presence) or `rebrand-orange-palette` (which established the visual tokens). It only constrains the hero's vertical spacing and removes a redundant brand wordmark.

## ADDED Requirements

### Requirement: The login hero MUST NOT render a redundant "DameRide" wordmark text node

The login screen at `app/(auth)/login.tsx` SHALL render exactly one brand expression in its hero — the `<DameRideLogo>` SVG mark. The screen MUST NOT render a separate visible `<Text>` node whose visible content is the literal string `"DameRide"`. The brand name MUST continue to surface to assistive technology via the logo's `accessibilityLabel="DameRide"` prop.

The tagline `"Comparte tu ruta, ahorra dinero y viaja acompañado."` MUST remain in the hero, rendered directly beneath the logo.

#### Scenario: Login no longer contains a visible "DameRide" wordmark

- **GIVEN** the change has merged
- **WHEN** a developer runs `rg -n '>DameRide<' app/\(auth\)/login.tsx`
- **THEN** the command returns no matches

#### Scenario: The logo's accessibility label still announces the brand

- **GIVEN** the change has merged
- **WHEN** a developer reads `app/(auth)/login.tsx`
- **THEN** the file contains a `<DameRideLogo>` element with `accessibilityLabel="DameRide"`
- **AND** that `<DameRideLogo>` is rendered with `size={140}`

#### Scenario: The tagline is preserved verbatim and lives in the hero stack

- **GIVEN** the change has merged
- **WHEN** a developer reads the hero block of `app/(auth)/login.tsx`
- **THEN** the literal string `"Comparte tu ruta, ahorra dinero y viaja acompañado."` appears exactly once as the visible text of a `<Text>` node
- **AND** that `<Text>` is a direct child of the hero stack (no intermediate `<View>` wraps it)
- **AND** the `<Text>` retains its previous className `font-jakarta text-sm text-on-surface-variant text-center max-w-[290px] leading-5`

### Requirement: The login hero MUST use tightened vertical spacing values

The login screen at `app/(auth)/login.tsx` SHALL apply the following Tailwind spacing classes verbatim:

- The outer screen container (the `<View>` that wraps the hero stack and the auth card) MUST have classes `px-5 gap-3 pt-1`.
- The hero stack (the `<View>` that wraps the logo row and the tagline) MUST have classes `items-center gap-2`.
- The logo row (the `<View>` that wraps the single `<DameRideLogo>`) MUST have classes `flex-row items-center justify-center py-4`.

The implementer MAY substitute the logo row's `py-4` with `py-5` if and only if iPhone SE QA confirms the hero reads as too tight at `py-4`. No other deviation from the listed classes is permitted by this requirement.

#### Scenario: Outer screen container uses the tightened classes

- **GIVEN** the change has merged
- **WHEN** a developer runs `rg -n 'px-5 gap-3 pt-1' app/\(auth\)/login.tsx`
- **THEN** the command returns exactly one match
- **AND** running `rg -n 'px-5 gap-4 pt-2' app/\(auth\)/login.tsx` returns no matches

#### Scenario: Hero stack uses the tightened gap

- **GIVEN** the change has merged
- **WHEN** a developer reads the hero stack `<View>` in `app/(auth)/login.tsx`
- **THEN** its classes include `items-center` and `gap-2`
- **AND** the previous `gap-3` on that node is gone

#### Scenario: Logo row uses py-4 (or py-5 as documented fallback)

- **GIVEN** the change has merged
- **WHEN** a developer reads the logo row `<View>` in `app/(auth)/login.tsx`
- **THEN** its classes are either `flex-row items-center justify-center py-4` or `flex-row items-center justify-center py-5`
- **AND** if `py-5` was chosen, the PR description records the iPhone SE QA result that motivated it

### Requirement: The login screen MUST preserve its keyboard-safe scroll structure

The login screen at `app/(auth)/login.tsx` SHALL continue to wrap its content tree in this exact nested order: `<SafeAreaView>` (from `react-native-safe-area-context`) → `<KeyboardAvoidingView>` → `<ScrollView>` → screen content. The `KeyboardAvoidingView` MUST keep its `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` prop. The `ScrollView` MUST keep its `contentContainerStyle={{ paddingBottom: 40 }}` and its `keyboardShouldPersistTaps="handled"` prop. None of these wrappers may be removed, reordered, or replaced as part of this change.

#### Scenario: SafeArea + KeyboardAvoidingView + ScrollView structure intact

- **GIVEN** the change has merged
- **WHEN** a developer reads `app/(auth)/login.tsx`
- **THEN** the rendered tree contains, in this nesting order, `<SafeAreaView>`, `<KeyboardAvoidingView>`, and `<ScrollView>`
- **AND** the `<KeyboardAvoidingView>` has prop `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
- **AND** the `<ScrollView>` has prop `contentContainerStyle={{ paddingBottom: 40 }}`
- **AND** the `<ScrollView>` has prop `keyboardShouldPersistTaps="handled"`

#### Scenario: The "Iniciar sesion" button remains reachable when the keyboard is open

- **GIVEN** the change has merged
- **AND** a tester is on an iPhone 17 Pro simulator on the login screen
- **WHEN** the tester taps the password input so the software keyboard opens
- **THEN** the "Iniciar sesion" button remains fully tappable above the keyboard
- **AND** no clipping of the button occurs

#### Scenario: Small-device usability is preserved on iPhone SE

- **GIVEN** the change has merged
- **AND** a tester is on an iPhone SE simulator on the login screen
- **WHEN** the screen renders with the keyboard closed
- **THEN** the logo and the tagline are both fully visible above the auth card
- **AND** no horizontal overflow is visible
- **WHEN** the tester focuses the password input
- **THEN** the "Iniciar sesion" button is reachable with at most one short scroll

### Requirement: The login screen MUST NOT change Spanish UI copy beyond removing the redundant wordmark

The change at hand SHALL NOT alter any visible Spanish string in `app/(auth)/login.tsx` other than removing the redundant `"DameRide"` wordmark `<Text>` node. Specifically, the strings `"Comparte tu ruta, ahorra dinero y viaja acompañado."`, `"Crear cuenta"`, `"o inicia con correo"`, `"Correo electrónico"`, `"Contraseña"`, `"Tu contraseña"`, `"tu@correo.com"`, and `"Iniciar sesion"` MUST appear verbatim.

#### Scenario: All preserved strings still appear verbatim

- **GIVEN** the change has merged
- **WHEN** a developer greps `app/(auth)/login.tsx` for each of the strings listed above
- **THEN** each string returns exactly one match
- **AND** none of the strings has been re-cased, re-spelled, or re-accented

### Requirement: The login screen MUST NOT introduce theme, token, or component-API changes

The change at hand SHALL be a layout/spacing edit only. It MUST NOT modify `src/constants/theme.ts`, `tailwind.config.js`, `src/components/DameRideLogo.tsx`, `src/components/Input.tsx`, or `src/components/Button.tsx`. The `<DameRideLogo>` prop set on the login screen MUST remain `size={140}` and `accessibilityLabel="DameRide"` — no new props, no changed values.

#### Scenario: Token files are untouched

- **GIVEN** the change has merged
- **WHEN** the implementer runs `git diff src/constants/theme.ts tailwind.config.js`
- **THEN** both diffs are empty

#### Scenario: Shared UI primitives are untouched

- **GIVEN** the change has merged
- **WHEN** the implementer runs `git diff src/components/DameRideLogo.tsx src/components/Input.tsx src/components/Button.tsx`
- **THEN** all three diffs are empty

#### Scenario: DameRideLogo props on the login screen are unchanged

- **GIVEN** the change has merged
- **WHEN** a developer reads the `<DameRideLogo>` element in `app/(auth)/login.tsx`
- **THEN** it has exactly two props: `size={140}` and `accessibilityLabel="DameRide"`
