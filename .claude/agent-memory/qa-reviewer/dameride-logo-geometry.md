---
name: dameride-logo-geometry
description: Recurring pitfalls in src/components/DameRideLogo.tsx inline SVG (viewBox centering + mask grouping)
metadata:
  type: project
---

`src/components/DameRideLogo.tsx` is an inline SVG transcription of `assets/images/logo.svg`.
It has produced two defects across implementations:

1. **Off-center viewBox.** Source SVG canvas is 1080×1350 but artwork bbox is x 126→948,
   y ~302 (dome top, = dome arc cy 510 − ry 208) → ~1040 (smile arc bottom). Center ≈ (537,671).
   Correct viewBox is the 900px square `"87 221 900 900"` (87=537−450, 221=671−450).
   A prior rev used `"0 280 1080 1080"` which was top-left shoved.
2. **Wheels punched by arch cutouts.** The masked `<G mask="url(#dameRideCutouts)">` must
   contain ONLY the body `<Path>` and dome `<Path>`. The two wheel `<Circle>`s and the
   smile `<Path>` must be UNMASKED siblings painted AFTER `</G>` (source paint order:
   body → dome → cutouts → wheels-on-top → smile). If wheels are inside the masked G the
   arch cutouts subtract them into crescents.

Other invariants: smile path token must be `764 900` (never `764900` — source SVG typo).
Mask is `maskUnits="userSpaceOnUse"` with full-canvas bounds `0 0 1080 1350` (viewBox-independent).
Public API is frozen: `{ size: number; color?: string; accessibilityLabel? }`, default export
`DameRideLogo`, `color = Colors.primary`, a11y branches on presence of `accessibilityLabel`.

**How to apply:** On any DameRideLogo review, grep for `764900`, `0 280 1080 1080`, and
structurally verify the masked `<G>` has exactly 2 children (body + dome) with wheels/smile
after it. Mask-after-sibling compositing on RN-svg ^15 works on iOS+Android (supported in 15.x).
See [[project-commands]] for verification commands.
