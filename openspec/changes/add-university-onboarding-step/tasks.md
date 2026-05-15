# Tasks: Add University and Carnet Onboarding Step

Work top-down. Each phase should be independently reviewable.

## Phase 1 — Database

- [x] 1.1 Create migration `supabase/migrations/<timestamp>_add_profile_university_and_student_id.sql` that runs:
  ```sql
  alter table public.profiles
    add column if not exists university text,
    add column if not exists student_id text;
  ```
  Both columns must be **nullable**. Do not add a check constraint, default, or index.
- [x] 1.2 Apply the migration to the linked remote Supabase project (local stack not running). Confirmed via `supabase migration list --linked` that `20260514120000` is present in both local and remote, and via `supabase gen types typescript --linked` that `profiles.university` and `profiles.student_id` are both `text | null`.

## Phase 2 — Types

- [x] 2.1 Regenerated `src/types/supabase.ts` from the remote schema via `npx supabase gen types typescript --linked --schema public`. Confirmed `university` and `student_id` appear in `profiles` Row/Insert/Update as `string | null`. `tsc --noEmit` passes clean.
- [x] 2.2 Add `university: string | null` and `student_id: string | null` to the `Profile` interface in `src/types/database.ts`.
- [x] 2.3 Update `PROFILE_SELECT` in `src/lib/database.ts` to include `university, student_id`.
- [x] 2.4 Confirm `tsc --noEmit` (or the project's typecheck command) passes with no new errors.

## Phase 3 — Onboarding constants

- [x] 3.1 In `app/onboarding.tsx`, add a `UNIVERSITIES` array of 14 entries in the order specified in the proposal (UNAN-Managua, UNAN-León, UCA, UNI, UNA, UPOLI, UAM, Keiser University, UNICA, UCC, UDO, BICU, URACCAN, UCATSE). Define `OTHER_UNIVERSITY_OPTION = 'Otra'` as a separate constant so it can be referenced without magic strings.

## Phase 4 — Onboarding state machine

- [x] 4.1 Widen the `Step` type from `0 | 1 | 2 | 3 | 4` to `0 | 1 | 2 | 3 | 4 | 5`.
- [x] 4.2 Add state: `university` (string), `universityPickerVisible` (bool), `universitySearch` (string), `studentId` (string), `customUniversity` (string).
- [x] 4.3 Hydrate the new state from `profile.university` / `profile.student_id` in the existing `useEffect`. If `profile.university` is set and is not in the curated list, hydrate `customUniversity` with it and set `university` to `OTHER_UNIVERSITY_OPTION`.
- [x] 4.4 In `goNext`, replace the `step === 1` validation gate so that after step 1 the user advances to the new step 2. Add a new gate for `step === 2` that calls a `validateUniversity()` helper before advancing.
- [x] 4.5 In `goNext`, shift the existing `step === 2` department gate to `step === 3`. Cap `Math.min(current + 1, 5)`.
- [x] 4.6 In the step-3 vehicle-decision branch, change `setStep(4)` to `setStep(5)`. In the "Omitir por ahora" handler, the call is unchanged (it still calls `saveProfileAndFinish('home')`).
- [x] 4.7 Update `totalSteps` so the denominator is `5` for steps 0–4 and `6` for step 5.

## Phase 5 — New step UI

- [x] 5.1 Render a new `step === 2` block:
  - Title: `"Tu universidad"`, subtitle in Spanish explaining we use this to connect students by campus.
  - University field: `TouchableOpacity` styled identically to the existing department field, opening `universityPickerVisible`.
  - When `university === OTHER_UNIVERSITY_OPTION`, render an inline `Input` labeled `"Nombre de tu universidad"` bound to `customUniversity`.
  - Carnet `Input` with label `"Carnet"`, placeholder example, and `autoCapitalize="characters"`.
  - "Continuar" `Button` calling `goNext`.
- [x] 5.2 Add a second `Modal` (mirroring the department picker) for `universityPickerVisible`, with the same search box, accent-insensitive filter via `normalizeSearchText`, and selectable rows. The "Otra" row should be visually identical to the others (no special icon needed).
- [x] 5.3 Implement `validateUniversity()`: returns false (and shows an `Alert.alert` in Spanish) if `university` is empty, if `university === OTHER_UNIVERSITY_OPTION` and `customUniversity.trim()` is empty, or if `studentId.trim()` is empty.

## Phase 6 — Persistence

- [x] 6.1 In `saveProfileAndFinish`, derive `universityForStorage = university === OTHER_UNIVERSITY_OPTION ? customUniversity.trim() : university`.
- [x] 6.2 Add `university: universityForStorage` and `student_id: studentId.trim()` to the `updateProfile` payload.
- [x] 6.3 Re-run `validateUniversity()` defensively at the top of `saveProfileAndFinish` (after `validateProfile`, before the department check), so step 5 finishers cannot bypass it via state shenanigans.

## Phase 7 — Profile screen display

- [x] 7.1 In `app/(tabs)/perfil.tsx`, add a new "Estudios" section. Render `profile.university` and `profile.student_id` as read-only rows. Hide each row when its value is `null`.
- [x] 7.2 Use existing typography and card styling from the surrounding profile sections — no new design tokens.

## Phase 8 — Manual QA

- [ ] 8.1 Walk through onboarding as a brand-new user; verify acceptance criteria 1–10 from `proposal.md`.
- [ ] 8.2 Sign in as a user whose profile predates the migration; verify acceptance criteria 11–12.
- [ ] 8.3 Inside the new step, switch between curated entries and "Otra" multiple times; verify the inline input appears and disappears correctly and is blank by default the first time it appears.
- [ ] 8.4 Hit the back arrow on steps 2 and 3; verify acceptance criteria 13–14.
- [ ] 8.5 Inspect Supabase: confirm one new row has the chosen `university` written verbatim (and never the literal "Otra") and `student_id` matches what was typed (trimmed, uppercased only if the user typed it that way).
