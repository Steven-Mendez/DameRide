# Replace the PNG-Backed `DameRideLogo` with an Inline SVG Implementation

## Why

`src/components/DameRideLogo.tsx` currently renders the brand mark by loading `assets/images/dame-ride-logo.png` through `<Image>` and recoloring it via `tintColor`. That approach has three concrete drawbacks:

1. **Raster artifacting.** The PNG is a single fixed-resolution asset; at the 120 px size used by `<BrandSplash>` and the 120–160 px sizes used on the login screen, edges of the dome and wheel arcs visibly soften on high-DPR devices. An inline SVG renders crisp at any size.
2. **No true cutouts.** `tintColor` recolors every non-transparent pixel of the PNG, so any "cutouts" baked into the PNG are only correct against the surface the PNG was authored against. The mark is consumed against at least three different surfaces today — `Colors.background` cream on `<BrandSplash>` and the login screen, plus the native splash background — so the current PNG cannot be perfectly correct everywhere.
3. **Bundle weight.** The PNG ships in the production bundle even though `react-native-svg ^15.12.1` is already a dependency and the geometry is simple enough to encode inline as a handful of `<Path>` and `<Circle>` nodes.

`react-native-svg` is already installed (`^15.12.1`), so this change requires no new dependencies. The component's public API — `{ size: number; color?: string; accessibilityLabel?: string }` — is preserved byte-for-byte, so none of the four known consumers (`app/(auth)/login.tsx`, `app/index.tsx`, `app/_layout.tsx`, `src/components/BrandSplash.tsx`) require any edits.

## What Changes

- **Rewrite `src/components/DameRideLogo.tsx`** to render the brand mark as inline SVG using `Svg`, `Path`, `Circle`, `Mask`, `Rect`, and `G` from `react-native-svg`. Keep the file path, the default export, and the exact prop shape so all current call sites continue to work unmodified.
- **Lock the viewBox to a square `87 221 900 900`.** The user-provided source SVG has a 1080×1350 viewBox where the car artwork sits in the upper part of the canvas; passing that viewBox to a square `<Svg width={size} height={size}>` would either squish the geometry vertically or float it inside a tall empty canvas. The actual artwork bounding box is approximately x `126`→`948` (center x ≈ `537`) and y `302` (dome top) → `~1040` (smile bottom) (center y ≈ `671`). A 900px square centered on `(537, 671)` gives `minX = 537 − 450 = 87`, `minY = 671 − 450 = 221`, i.e. `viewBox="87 221 900 900"` — ~39px horizontal and ~81px vertical padding around the art, keeping the mark centered. That window is what gets locked in.
- **Drop the background `<rect width="1080" height="1350" fill="#000"/>`.** The mark must render on a transparent background so it composes cleanly on `Colors.background` cream (login, `<BrandSplash>`), on white, and on any future surface. The black rectangle is purely an authoring-time backdrop.
- **Use a `<Mask>` to render the cutouts as true transparency** (instead of filling them with a surface color), and apply that mask **only to the shapes the cutouts are meant to subtract**. The three subtractive shapes that were originally `fill="#000"` in the source SVG — the window, the left wheel arch, and the right wheel arch — must end up as see-through holes in the car body and dome, not as cream-filled regions. A `<Mask>` (`maskUnits="userSpaceOnUse"`) whose base is a full-canvas white `<Rect>` (`x="0" y="0" width="1080" height="1350"`, matching the `<Mask>` bounds so it is independent of the viewBox) and whose three black children subtract the window + both wheel arches achieves this on any background. The masked `<G mask="url(#dameRideCutouts)">` group contains **only the car body path and the dome path**. The two wheel `<Circle>`s and the smile `<Path>` are rendered **after** the masked group and **outside** the mask, filled with `color`, reproducing the source SVG's exact paint order (body → dome → cutouts → wheels-on-top → smile). Rationale for picking a mask over a `cutoutColor` prop: the public API explicitly only takes a single `color`. Adding a `cutoutColor` prop to track the surface color would (a) break the byte-for-byte API preservation goal of this change, and (b) couple every consumer to its own surface knowledge. The mask approach keeps the API untouched and makes the logo correct against arbitrary backgrounds.
- **Apply the `color` prop (default `Colors.primary`) as the `fill` of every painted shape.** The source SVG used `fill="#fff"` for the car body, dome, wheels, and smile; in the new component these all become `fill={color}` (the body/dome inside the masked group, the wheels and smile outside it). The three cutout shapes (originally `fill="#000"`) become `fill="#000"` inside the `<Mask>` only, which `react-native-svg` interprets as "subtract from the mask," producing transparent holes in the masked body/dome geometry without affecting the wheels or smile.
- **Fix the typo in the smile path.** The user-supplied SVG contains `A 249 249 0 0 0 764900 A 237 237 0 0 1 699 873`, where `764900` is a malformed pair — it should be two numbers (`764 900`). The corrected smile path is encoded verbatim in the spec and the implementer must transcribe it exactly.
- **Preserve a11y behavior.** When `accessibilityLabel` is provided, the `<Svg>` root receives `accessible={true}`, `accessibilityRole="image"`, and the label. When `accessibilityLabel` is omitted, the `<Svg>` is not exposed as an accessibility node (matches current PNG behavior — `accessible={accessibilityLabel ? true : false}`).
- **Delete `assets/images/dame-ride-logo.png` after grep confirms it's orphaned.** Once the rewrite lands, `rg -n "dame-ride-logo" app src components` should match zero files (the historical OpenSpec proposals under `openspec/changes/rebrand-orange-palette/` and `openspec/changes/wire-brand-logo-everywhere/` still mention the asset name, but those are frozen historical text and are not "live" code references). Deletion happens only after that grep is confirmed clean across the live source tree.

## Scope

In scope:
- Rewriting `src/components/DameRideLogo.tsx` to render inline SVG via `react-native-svg`.
- Deleting `assets/images/dame-ride-logo.png` once it is confirmed orphaned across `app/`, `src/`, and `components/`.
- Verifying — without editing — that `app/(auth)/login.tsx`, `app/index.tsx`, `app/_layout.tsx`, and `src/components/BrandSplash.tsx` continue to compile and render correctly with the new component.

## Non-Goals

- **Changing the public API of `DameRideLogo`.** `size`, `color`, and `accessibilityLabel` stay exactly as documented. No new props (no `cutoutColor`, no `strokeWidth`, no `variant`).
- **Editing any consumer.** Login, index, `_layout`, and `BrandSplash` are explicitly untouched.
- **Reauthoring the artwork.** The car geometry comes from the user-supplied SVG verbatim (with the one numeric typo corrected). This change does not retune proportions, add a stroke, simplify paths, or otherwise redesign the mark.
- **Tightening the viewBox further.** `87 221 900 900` is a comfortable square crop centered on the artwork. The implementer must not nudge it to any other variant mid-implementation without a follow-up change — locking the viewBox in the spec keeps visual review deterministic.
- **Animating the logo.** Static render only.
- **Deleting other raster assets** (`hero_illustration.png`, `splash-icon.png`, `icon.png`, `android-icon-foreground.png`). Out of scope; those have their own deletion criteria.
- **Updating the native `splash-icon.png`** to match the new SVG. Separate change (requires raster tooling).

## Risks and Mitigations

- **Visual regression vs. the PNG.** The new SVG is rendered from path data, not from the PNG. Tiny geometric differences (sub-pixel positioning, antialiasing) are expected. Mitigation: side-by-side compare on the login screen and `<BrandSplash>` during QA; if a difference is large enough to be noticeable at 120 px, reopen the viewBox decision in a follow-up.
- **Wheels subtracted by arch cutouts (corrected defect).** The first implementation placed the wheel `<Circle>`s and the smile inside the masked `<G>`, so the wheel-arch cutouts punched holes out of the wheels and they rendered as crescents instead of solid circles. Mitigation: the spec now requires the masked group to contain only the body and dome, with wheels and smile painted unmasked after it (matching the source SVG paint order); an acceptance grep asserts the wheel `<Circle>`s and smile `<Path>` are not descendants of the masked `<G>`.
- **Mask support on Android.** `react-native-svg` `<Mask>` is supported on both iOS and Android in `^15.x` (the project is on `^15.12.1`). Mitigation: manual QA on both platforms before merge. If `<Mask>` misbehaves on Android specifically, fall back to filling the cutout shapes with the consumer's surface color via a single hard-coded `Colors.background` — but only as an emergency fallback, and the spec change goes through `MODIFIED Requirements`, not silently.
- **Typo regression.** The user-provided SVG contains the `764900` typo; if the implementer pastes the SVG verbatim, the smile renders garbage. Mitigation: the spec lists the corrected smile path verbatim and the tasks file includes an explicit grep for `764900` returning zero matches after the rewrite.
- **Asset deletion without grep.** Deleting `dame-ride-logo.png` before confirming all references are removed would break the build. Mitigation: tasks file requires `rg -n "dame-ride-logo" app src components` to return zero matches as a precondition to deletion, and `rg` excludes `openspec/changes/` historical proposals.
- **Consumer drift.** A consumer could be passing an undocumented prop today (e.g. `style`) that the PNG `<Image>` silently absorbed but the new `<Svg>` won't. Mitigation: tasks file requires reading each of the four known consumers and confirming they only pass `size`, `color`, and/or `accessibilityLabel`.

## Amendment — Defect Correction (2026-05-15)

This change was implemented and then failed QA + user visual review on two points. The original spec text was wrong for these reasons, recorded here so the rationale is not lost:

1. **viewBox was off-center.** The original spec locked `viewBox="0 280 1080 1080"`. The real artwork bounding box is x `126`→`948` (center x ≈ `537`) and y `302`→`~1040` (center y ≈ `671`); the smile bottom is near `y=1040`, not `~948` as originally estimated. The `0 280 1080 1080` window starts at the far left (`x=0`) and stops at `y=1360`, shoving the mark to the top-left with a large dead band at the bottom, so it rendered small and visually top-heavy. Corrected to a 900px square centered on `(537, 671)` → `viewBox="87 221 900 900"`.
2. **Wheels were subtracted by the wheel-arch cutouts.** The original spec put the wheel `<Circle>`s and the smile inside the masked `<G>`, so the arch cutouts punched holes out of the wheels and they rendered as crescents. The source SVG paints the white wheel circles *after* and *on top of* the black arch holes, so the wheels read as solid circles with only a thin crescent of background ("wheel well") showing. Corrected so the masked `<G>` contains only the body + dome, and the wheels + smile are painted unmasked after it, reproducing the source paint order.

Only the viewBox value and the masked-vs-unmasked grouping changed. All path/circle coordinate data remains byte-identical to `assets/images/logo.svg` (with the already-applied `764 900` smile typo fix). Public API, default export name, a11y behavior, and the PNG deletion are unchanged.

## Acceptance Criteria

QA can verify each line independently:

1. `src/components/DameRideLogo.tsx` no longer imports from `'react-native'` for `Image` and no longer calls `require('@/assets/images/dame-ride-logo.png')`. It imports `Svg`, `Path`, `Circle`, `Mask`, `Rect`, and `G` from `'react-native-svg'`.
2. The component's exported props type is exactly `{ size: number; color?: string; accessibilityLabel?: string }` — no additions, no removals, no renames.
3. The `<Svg>` root has `width={size}`, `height={size}`, and `viewBox="87 221 900 900"`.
4. There is exactly one `<G mask="url(#dameRideCutouts)">` group, and it contains exactly two painted shapes: one `<Path>` for the car body and one `<Path>` for the dome. The two wheel `<Circle>` elements and the smile `<Path>` are rendered AFTER that group as siblings, NOT as descendants of it, and are unmasked. The `<Mask id="dameRideCutouts">` uses `maskUnits="userSpaceOnUse"` with `x="0" y="0" width="1080" height="1350"`, and contains a white-filled `<Rect x="0" y="0" width="1080" height="1350">` base plus exactly three black-filled cutout `<Path>` elements (window, left wheel arch, right wheel arch).
5. `rg -n "764900" src` returns zero matches (typo was corrected during transcription).
6. `rg -n "dame-ride-logo" app src components` returns zero matches.
7. `assets/images/dame-ride-logo.png` does not exist on disk.
8. None of `app/(auth)/login.tsx`, `app/index.tsx`, `app/_layout.tsx`, or `src/components/BrandSplash.tsx` are modified by this PR (verify with `git diff --name-only` against the branch base — the four files must not appear).
9. `npx tsc --noEmit` exits 0.
10. Cold-launch on iOS simulator and Android emulator: the logo on the login screen and inside `<BrandSplash>` renders with crisp orange (`#FF6A2C` / `Colors.primary`) geometry, centered (not top-heavy) within its square footprint. The window and both wheel arches are visibly transparent (cream shows through on login + splash, white through on a white surface). Each wheel renders as a SOLID orange circle sitting on top of its arch — NOT as a crescent — with only a thin transparent "wheel well" crescent of background between the wheel and the body. The smile renders as a solid orange shape.

## Open Questions

None blocking. Items the implementer should record in the PR description:
- Confirmation that `<Mask>` rendered identically on iOS and Android during manual QA.
- Whether any consumer (login, index, `_layout`, `BrandSplash`) showed a visible diff vs. the PNG version at the sizes they use in production.
