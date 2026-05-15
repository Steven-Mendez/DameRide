# Spec Delta: Tabs — Scrollable Content Must Clear the Tab Bar

## ADDED Requirements

### Requirement: Scrollable content in tab screens MUST clear the tab bar dynamically

Every scrollable container (`<ScrollView>` or `<FlatList>`) rendered as the primary content surface of a screen inside the `(tabs)` group SHALL apply a `paddingBottom` to its `contentContainerStyle` equal to the value returned by `useBottomTabBarHeight()` (imported from `@react-navigation/bottom-tabs`) plus an additional `24` pixels of breathing room. Hardcoded numeric `paddingBottom` constants (e.g. `100`, `110`) MUST NOT be used for the purpose of clearing the tab bar.

This requirement applies to the four current tab screens — `app/(tabs)/perfil.tsx`, `app/(tabs)/reservas.tsx`, `app/(tabs)/publicar.tsx`, `app/(tabs)/buscar.tsx` — and to any future screen added under `app/(tabs)/` that renders a scrollable container as its primary surface.

Other `contentContainerStyle` keys (e.g. `paddingHorizontal`, `gap`) MUST be preserved when adding the dynamic `paddingBottom`.

#### Scenario: Profile screen's scrollable bottom padding clears the tab bar on iPhone 17 Pro

- **GIVEN** the user is on the `perfil` tab on an iPhone 17 Pro simulator
- **WHEN** the user scrolls to the bottom of the screen
- **THEN** the "Cerrar sesión" button is fully visible above the tab bar
- **AND** at least 16 pixels of empty space separate the bottom of the button from the top of the tab bar

#### Scenario: Publish screen's submit button clears the tab bar

- **GIVEN** the user is on the `publicar` tab on an iPhone 17 Pro simulator
- **WHEN** the user scrolls the form to the bottom
- **THEN** the "Publicar viaje" submit button is fully visible above the tab bar with breathing room

#### Scenario: Reservations list's last card clears the tab bar

- **GIVEN** the user is on the `reservas` tab with at least one reservation rendered
- **WHEN** the user scrolls to the end of the list
- **THEN** the last reservation card is fully visible above the tab bar with breathing room

#### Scenario: Search FlatList's last row clears the tab bar without losing horizontal padding

- **GIVEN** the user is on the `buscar` tab with at least one result rendered
- **WHEN** the user scrolls to the end of the `<FlatList>`
- **THEN** the last result row is fully visible above the tab bar with breathing room
- **AND** the list still has 20 px of horizontal padding and 16 px gap between items, as before

#### Scenario: No hardcoded paddingBottom-100 or paddingBottom-110 remains in tabs

- **GIVEN** the change has merged
- **WHEN** an engineer greps for `paddingBottom: 100` or `paddingBottom: 110` under `app/(tabs)/`
- **THEN** both searches return zero matches

#### Scenario: Tab bar height changes are absorbed automatically

- **GIVEN** a device with a home indicator (e.g. iPhone 17 Pro) and a device without (e.g. iPhone SE)
- **WHEN** the same tab screen renders on each device
- **THEN** the bottom padding adapts to the actual measured tab bar height on each device without code changes
