---
name: openspec-conventions
description: How the RideTogether repo structures OpenSpec changes, validation, and the branding capability
metadata:
  type: project
---

RideTogether uses OpenSpec at `openspec/`. Change folders live in `openspec/changes/<kebab-name>/` with `proposal.md`, `tasks.md`, and `specs/<capability>/spec.md`. Canonical (archived) capability specs live at `openspec/specs/<capability>/spec.md`.

**Why:** The repo follows OpenSpec strictly; reviewers expect the existing `refine-login-hero-spacing` change folder shape.

**How to apply:**
- Spec deltas use `## ADDED Requirements` / `## MODIFIED Requirements` / `## REMOVED Requirements`, with `### Requirement: <name>` (MUST/SHALL language) and `#### Scenario:` blocks using `- **GIVEN** / **WHEN** / **THEN** / **AND**` bullets.
- proposal.md sections used in this repo: `## Why`, `## What Changes`, `## How`, `## Scope`, `## Non-Goals`, `## Risks and Mitigations`, `## Acceptance Criteria`, `## Open Questions`.
- tasks.md is phased (`## Phase 1 — ...`) with `- [ ]` checkboxes numbered `N.M`.
- There is an existing `branding` capability (`openspec/specs/branding/spec.md`) governing `<DameRideLogo>`. Extend it as a delta for brand-color/visual-treatment changes.
- Validation command is `npm run validate` = `npm run lint && npm run typecheck` (per package.json scripts).
- Stack: Expo SDK 54, React Native, NativeWind/Tailwind. Theme tokens in `src/constants/theme.ts`; Tailwind tokens like `bg-primary`/`text-on-primary` map to `Colors.*`.
