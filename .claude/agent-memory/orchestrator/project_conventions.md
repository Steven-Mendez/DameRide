---
name: project-conventions
description: RideTogether/DameRide stack, spec convention (OpenSpec), commands, and key directories
metadata:
  type: project
---

Stack & conventions for the RideTogether (DameRide) repo.

**Why:** Avoid re-detecting on every session; subagents need this context to produce work that fits the codebase.

**How to apply:** Pass the relevant pieces to spec-writer / implementer / qa-reviewer as part of the brief.

- Spec convention: **OpenSpec** at `openspec/` (config `openspec/config.yaml`, `specs/`, `changes/`).
- Stack: Expo SDK 54, React Native 0.81, expo-router 6, TypeScript, NativeWind/Tailwind, Supabase, react-hook-form + zod, lucide-react-native icons.
- Lint: `npm run lint`. Typecheck: `npm run typecheck`. Combined: `npm run validate`. No formal test runner configured.
- Supabase migrations live in `supabase/migrations/`. Generate types via `npm run supabase:types`.
- Path alias `@/` maps to repo root; feature DB helpers in `src/lib/database.ts`; types in `src/types/`.
- Onboarding flow: `app/onboarding.tsx` (single screen, multi-step state machine).
- UI primitives: `src/components/Button.tsx`, `src/components/Input.tsx`. Theme tokens in `src/constants/theme.ts` (Colors, Shadows).
