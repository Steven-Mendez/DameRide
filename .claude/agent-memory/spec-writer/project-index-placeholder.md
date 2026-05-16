---
name: project-index-placeholder
description: app/index.tsx is a non-user-visible placeholder behind the splash; scope specs accordingly
metadata:
  type: project
---

`app/index.tsx` is currently an obscured placeholder route behind the brand splash (result of a recently shipped navigator fix). It is NOT user-visible in the normal app flow.

**Why:** Surfaced while scoping the `fix-ride-cta-contrast` change. `index.tsx` shares the same `bg-primary-container` / `bg-secondary-container` "looks disabled" CTA styling as the Buscar ride card, but is intentionally left out of UI-fix scope because users don't see it.

**How to apply:** When a UI/branding fix touches shared styling that also appears in `app/index.tsx`, do NOT require changing `index.tsx` — explicitly note it as out-of-scope-but-known in the spec so reviewers don't flag it as missed. Re-verify this status if a future change makes `index.tsx` user-visible again. See [[openspec-conventions]].
