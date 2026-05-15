# Spec Delta: Onboarding — University and Carnet Step

## ADDED Requirements

### Requirement: Onboarding MUST collect the student's university

During onboarding, after personal data and before department selection, the system SHALL prompt the student to choose their university from a curated list, with an "Otra" option that reveals an inline free-text input. The chosen value MUST be persisted to `profiles.university` before onboarding completes.

The curated list, in this exact order, MUST be:

1. UNAN-Managua
2. UNAN-León
3. UCA
4. UNI
5. UNA
6. UPOLI
7. UAM
8. Keiser University
9. UNICA
10. UCC
11. UDO
12. BICU
13. URACCAN
14. UCATSE

A 15th picker entry labeled **"Otra"** MUST be present at the bottom of the list. Selecting "Otra" MUST NOT itself be persisted; instead, the free-text value the student types in the revealed input is what gets written to `profiles.university`.

#### Scenario: Student picks a curated university

- **GIVEN** a new user has completed step 1 (personal data)
- **WHEN** they advance to the university step, open the picker, and tap "UCA"
- **THEN** the picker closes
- **AND** the university field displays "UCA"
- **AND** no inline free-text input is shown
- **AND** advancing through onboarding writes the literal string "UCA" to `profiles.university`

#### Scenario: Student picks "Otra" and types a custom name

- **GIVEN** a new user is on the university step
- **WHEN** they open the picker, tap "Otra", and type "Universidad Hispanoamericana" into the inline input
- **THEN** the inline input is visible directly under the picker field
- **AND** advancing through onboarding writes the string "Universidad Hispanoamericana" to `profiles.university`
- **AND** the literal string "Otra" is never written to the database

#### Scenario: Student picks "Otra" but leaves the inline input blank

- **GIVEN** a new user is on the university step with "Otra" selected and the inline input empty
- **WHEN** they tap "Continuar"
- **THEN** an `Alert.alert` in Spanish names the university as the missing field
- **AND** the user remains on the university step

#### Scenario: University picker filters by accent-insensitive search

- **GIVEN** the university picker is open
- **WHEN** the student types "leon" into the search input
- **THEN** the list filters to entries whose normalized name contains "leon" (e.g. "UNAN-León")

### Requirement: Onboarding MUST collect the student's carnet

During the same onboarding step that collects the university, the system SHALL prompt the student for their carnet (student ID) using a plain text input. Validation MUST be limited to "required and non-empty after trimming" — no regex, length, or registry check. The trimmed value MUST be persisted to `profiles.student_id`.

The carnet input MUST use `autoCapitalize="characters"`. The system SHALL NOT alter the case of what the user typed beyond what the OS keyboard does naturally.

#### Scenario: Student enters a carnet

- **GIVEN** a new user is on the university step with a university selected
- **WHEN** they type "20231234" into the carnet input and tap "Continuar"
- **THEN** advancement proceeds to the department step
- **AND** completing onboarding writes "20231234" to `profiles.student_id`

#### Scenario: Carnet input is empty

- **GIVEN** a new user is on the university step with a university selected and the carnet input empty
- **WHEN** they tap "Continuar"
- **THEN** an `Alert.alert` in Spanish names the carnet as the missing field
- **AND** the user remains on the university step

#### Scenario: Carnet contains only whitespace

- **GIVEN** a new user is on the university step with a university selected and the carnet input containing only spaces
- **WHEN** they tap "Continuar"
- **THEN** the system treats the input as empty and shows the same Spanish missing-field alert

### Requirement: Onboarding step indices MUST shift to accommodate the new step

The onboarding state machine SHALL expand from 5 steps to 6 steps. The new university step MUST be inserted at index 2 (between personal data and department). The remaining steps MUST shift their indices by +1 without changing their behavior. The progress indicator denominator MUST update to 5 for steps 0–4 and 6 for step 5 (vehicle form).

#### Scenario: Progress label on intro

- **GIVEN** a new user opens the onboarding flow
- **WHEN** the intro screen is rendered
- **THEN** the progress label reads "Paso 1 de 5"

#### Scenario: Progress label on vehicle form

- **GIVEN** a new user has reached the vehicle form (former step 4, now step 5)
- **WHEN** the screen is rendered
- **THEN** the progress label reads "Paso 6 de 6"

#### Scenario: Back navigation preserves university and carnet

- **GIVEN** a user has filled the university and carnet, advanced to the department step, and tapped the back arrow
- **WHEN** the university step re-renders
- **THEN** the previously chosen university is still displayed in the field
- **AND** the previously typed carnet is still displayed in the input

### Requirement: Profile schema MUST gain nullable university and student_id columns

The `public.profiles` table SHALL have two new columns: `university text` and `student_id text`. Both columns MUST be nullable. The migration MUST NOT backfill existing rows, set defaults, or add check constraints. The `Profile` TypeScript interface and the `PROFILE_SELECT` constant in `src/lib/database.ts` MUST include both fields.

#### Scenario: Existing user predates the migration

- **GIVEN** a user whose `profiles` row was created before the migration ran
- **WHEN** the migration is applied
- **THEN** their row's `university` and `student_id` are both `null`
- **AND** opening the app does not crash on any screen
- **AND** the system does NOT re-trigger onboarding for them

### Requirement: Profile screen MUST surface saved university and carnet

The profile tab (`app/(tabs)/perfil.tsx`) SHALL display the saved `university` and `student_id` in a read-only "Estudios" section. When either value is `null`, that row MUST be hidden (no placeholder, no dash). No edit affordance is in scope for this change.

#### Scenario: Profile shows saved values

- **GIVEN** a user whose profile has `university = "UCA"` and `student_id = "20231234"`
- **WHEN** they open the profile tab
- **THEN** the "Estudios" section shows two rows: one labeled with the university field name and value "UCA", one labeled with the carnet field name and value "20231234"
- **AND** neither row offers an edit button or pencil icon

#### Scenario: Profile hides null fields

- **GIVEN** a legacy user with `university = null` and `student_id = null`
- **WHEN** they open the profile tab
- **THEN** the "Estudios" section's rows are hidden
- **AND** no error or placeholder is rendered in their place
