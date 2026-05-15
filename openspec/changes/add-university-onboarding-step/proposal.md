# Add University and Carnet Onboarding Step

## Why

DameRide's audience is Nicaraguan university students sharing rides between campuses and home departments. Today the onboarding flow in `app/onboarding.tsx` collects name, phone, department, and (optionally) a vehicle, but never asks where the student studies or for their student ID ("carnet"). Capturing the **university** and **carnet** at sign-up gives us the minimum signal to (a) eventually show "verified student" affordances, (b) cluster rides by campus, and (c) build a directory of supported universities — without standing up any verification backend in the demo.

The change is intentionally light: the carnet is a free-text field, the university is picked from a curated list (with an "Otra" escape hatch), nothing is validated against an external registry, and we do not migrate or backfill existing rows.

## What Changes

- Add a new onboarding step **between current step 1 ("Datos personales") and current step 2 ("Departamento")** that asks the student for:
  - **Universidad** — bottom-sheet picker matching the existing department picker pattern, populated from a curated list of 14 Nicaraguan universities plus an "Otra" option that reveals an inline free-text input.
  - **Carnet** — plain `Input` with `autoCapitalize="characters"`, validated only as required + non-empty trim.
- Renumber the onboarding state machine from 5 steps to 6 steps (`Step` becomes `0 | 1 | 2 | 3 | 4 | 5`). Department becomes step 3, vehicle decision step 4, vehicle form step 5. Progress bar denominators (`totalSteps`) update accordingly.
- Persist both values via `updateProfile` alongside the existing `full_name`, `phone`, `city`, and `onboarding_completed_at`.
- Add a Supabase migration that adds two **nullable** columns to `public.profiles`: `university text` and `student_id text`. Regenerate `src/types/supabase.ts` and extend `Profile` in `src/types/database.ts` plus `PROFILE_SELECT` in `src/lib/database.ts`.
- Surface the two fields read-only on the existing profile screen (`app/(tabs)/perfil.tsx`) so the student can confirm what was saved. No edit affordance in this change.

## Why insert as the new step 2 (and not at the end)?

Two reasons:

1. **Topical grouping.** Steps 1 and the new step are both "about the student". Department (city) is about logistics. Vehicle is about "do you also drive?". Inserting the new step right after personal data keeps the flow conceptually clean: identity → location → role.
2. **Renumber blast radius is contained.** Inserting at position 2 only shifts steps 2/3/4 downward by one. The intro (step 0) and personal data (step 1) keep their indices, so the "first impression" of onboarding does not change. Putting it at the end would force us to special-case the "skip vehicle" branch (step 3 → finish) to also stop and collect university data, splitting the validation logic across two `saveProfileAndFinish` callsites.

## Scope

In scope:
- Migration for two nullable columns on `profiles`.
- Type regeneration and updates to `Profile` / `PROFILE_SELECT`.
- New onboarding step, including the bottom-sheet picker and "Otra" inline input.
- Persistence of `university` and `student_id` via `updateProfile`.
- Read-only display of both fields on the profile tab.
- Spanish copy throughout, matching the existing onboarding voice.

## Non-Goals

- **No verification of the carnet** against any university registry, OCR, or external API.
- **No backfill or migration** of existing users' rows. Pre-existing profiles keep `university = null` and `student_id = null`. We do not re-trigger onboarding for them.
- **No display of university outside the profile screen.** Ride cards, search results, and driver badges are unchanged.
- **No edit flow** for university or carnet in this change. Users can only set them once during onboarding.
- **No tests.** This repo has no test runner configured; manual QA is the verification path.
- **No analytics events** for the new step.

## Acceptance Criteria

QA can verify each line independently:

1. A new user signing up sees **6 steps** in the progress indicator (currently 5). The progress label reads "Paso 1 de 5" on the intro and "Paso 6 de 6" on the vehicle form.
2. Step 2 of the new flow is titled "Tu universidad" (or equivalent Spanish copy) and contains exactly two inputs: a university picker and a carnet text field.
3. Tapping the university field opens a bottom-sheet modal styled like the existing department picker, with a search input that filters case- and accent-insensitively.
4. The picker lists exactly 15 entries in this order: UNAN-Managua, UNAN-León, UCA, UNI, UNA, UPOLI, UAM, Keiser University, UNICA, UCC, UDO, BICU, URACCAN, UCATSE, **Otra**.
5. Selecting any entry other than "Otra" closes the picker and shows the chosen university's display name in the field.
6. Selecting "Otra" closes the picker and reveals a free-text `Input` labeled "Nombre de tu universidad". The string the user types in this input is what gets persisted; the literal value "Otra" is never written to the database.
7. The carnet `Input` uses `autoCapitalize="characters"` and accepts any non-empty trimmed string.
8. Tapping "Continuar" with either field empty (or with "Otra" selected and the free-text input empty) shows an `Alert.alert` in Spanish naming the missing field. The user does not advance.
9. Tapping "Continuar" with both fields filled advances the user to the existing department step (now step 3), without any other side effect.
10. After completing the flow, querying `select university, student_id from profiles where id = <new user>` returns the values entered in step 2, both non-null.
11. For an existing user whose profile predates the migration, `select university, student_id from profiles where id = <existing user>` returns `null, null` and the app does not crash on the profile tab.
12. The profile tab (`app/(tabs)/perfil.tsx`) shows the saved university and carnet under a new "Estudios" section. When either value is null, the field is hidden (no "—" placeholder).
13. Backing out from step 2 returns the user to step 1 with previously typed personal data preserved.
14. Backing out from step 3 (department) returns the user to the new step 2 with previously selected university and typed carnet preserved.

## Open Questions

None blocking. Future considerations (out of scope here): allowing the user to edit university/carnet later from a profile-edit screen; verifying the carnet via campus partnerships; promoting "Otra" entries that get popular into the curated list.
