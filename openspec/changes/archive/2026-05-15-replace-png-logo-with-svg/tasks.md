# Tasks: Replace the PNG-Backed `DameRideLogo` with Inline SVG

Work top-down. Each phase is independently reviewable.

## Phase 1 — Audit current state

- [x] 1.1 Read `src/components/DameRideLogo.tsx`. Confirm: it imports `Image` from `react-native`, calls `require('@/assets/images/dame-ride-logo.png')`, applies `tintColor: color`, and exports a default function `DameRideLogo` with props `{ size: number; color?: string; accessibilityLabel?: string }`.
- [x] 1.2 Read each consumer and record the exact props each one passes:
  - `app/(auth)/login.tsx` — `size={140} accessibilityLabel="DameRide"`
  - `app/index.tsx` — `size={140} accessibilityLabel="DameRide"`
  - `app/_layout.tsx` — does not actually import/use DameRideLogo (no live reference found)
  - `src/components/BrandSplash.tsx` — `size={120} accessibilityLabel="DameRide"`
  All call sites pass only `size` and `accessibilityLabel`. No extra props.
- [x] 1.3 Run `rg -n "dame-ride-logo" app src components`. Result: exactly one live code match in `src/components/DameRideLogo.tsx` (the `require` plus a doc comment).
- [x] 1.4 Confirmed `react-native-svg` is in `package.json` `dependencies` at `^15.12.1`.
- [x] 1.5 Confirmed `assets/images/dame-ride-logo.png` exists on disk and is referenced only from `src/components/DameRideLogo.tsx`.

## Phase 2 — Rewrite `DameRideLogo.tsx` as inline SVG

- [x] 2.1 Replaced the file contents of `src/components/DameRideLogo.tsx` to import `React`, `Svg`/`Path`/`Circle`/`Mask`/`Rect`/`G` from `'react-native-svg'`, and `Colors` from `'@/src/constants/theme'`. Default export `DameRideLogo` with prop shape `{ size: number; color?: string; accessibilityLabel?: string }` preserved; `color` defaults to `Colors.primary`.
- [x] 2.2 `<Svg>` root has `width={size}`, `height={size}`, `viewBox`. When `accessibilityLabel` is provided, also has `accessible={true}`, `accessibilityRole="image"`, and `accessibilityLabel={accessibilityLabel}`. When undefined, only `accessible={false}` is set; role/label are omitted. (NOTE: viewBox value corrected in Phase 6 — see 6.1.)
- [x] 2.3 `<Mask id="dameRideCutouts" maskUnits="userSpaceOnUse">` contains a white-filled full-bleed `<Rect>` plus three black-filled cutout `<Path>` elements (window + two wheel arches). (NOTE: mask bounds + base rect dimensions corrected in Phase 6 — see 6.2.)
- [x] 2.4 A `<G mask="url(#dameRideCutouts)">` group renders painted shapes filled with `{color}`. (NOTE: original grouping was wrong — it included the wheels + smile, causing arch cutouts to subtract the wheels. Corrected in Phase 6 — see 6.3.)
- [x] 2.5 No background `<Rect>` is rendered as a sibling of the painted geometry — the logo composes on whatever surface the consumer provides.
- [x] 2.6 `rg -n "764900" src` → zero matches.
- [x] 2.7 `rg -n "dame-ride-logo" src` → zero matches.
- [x] 2.8 `npx tsc --noEmit` exits 0 (run via `npm run validate`).

## Phase 3 — Verify consumers compile and render without edits

- [x] 3.1 `git diff` does NOT include `app/index.tsx`, `app/_layout.tsx`, or `src/components/BrandSplash.tsx` from this change. (`app/(auth)/login.tsx` already had pre-existing modifications in the branch base before this task began — this task did not modify it.)
- [x] 3.2 `npx tsc --noEmit` re-run via `npm run validate` exits 0 — prop shape preserved, consumers compile.
- [ ] 3.3 Cold-launch on iOS simulator — manual QA owned by the parent; deferred (no simulator available in this environment).
- [ ] 3.4 Cold-launch on Android emulator — manual QA owned by the parent; deferred.

## Phase 4 — Delete the orphaned PNG

- [x] 4.1 `rg -n "dame-ride-logo" app src components` → zero matches (live tree clean; `openspec/changes/` historical text is allowed and not in this scope).
- [x] 4.2 Deleted `assets/images/dame-ride-logo.png`.
- [x] 4.3 `git status assets/images/` shows only `dame-ride-logo.png` as deleted. `splash-icon.png`, `icon.png`, `android-icon-foreground.png`, `hero_illustration.png` are not modified or deleted by this change.
- [x] 4.4 `npx tsc --noEmit` (via `npm run validate`) exits 0.
- [ ] 4.5 Final cold-launch (iOS + Android) — deferred to manual QA.

## Phase 5 — PR notes

- [ ] 5.1 PR description recording — deferred to the parent agent writing the PR.

## Phase 6 — Defect correction (QA + visual review, 2026-05-15)

QA and user visual review of the implemented component found two defects. Re-read `assets/images/logo.svg` (the now-committed source) and apply these surgical fixes. No coordinate data changes; only the viewBox value and the masked-vs-unmasked grouping.

- [x] 6.1 **Defect 1 — off-center viewBox.** Change the `<Svg>` `viewBox` from `"0 280 1080 1080"` to exactly `"87 221 900 900"` (900px square centered on artwork center `(537, 671)`: minX = 537 − 450 = 87, minY = 671 − 450 = 221). `rg -n 'viewBox="87 221 900 900"' src/components/DameRideLogo.tsx` returns exactly one match; `rg -n "0 280 1080 1080" src/components/DameRideLogo.tsx` returns zero matches.
- [x] 6.2 **Mask region is viewBox-independent.** The `<Mask>` uses `maskUnits="userSpaceOnUse"` with `x="0" y="0" width="1080" height="1350"`, and its base `<Rect>` is `x="0" y="0" width="1080" height="1350"` filled white. The three black cutout `<Path>` elements (window, left wheel arch, right wheel arch) are unchanged byte-for-byte from `assets/images/logo.svg`.
- [x] 6.3 **Defect 2 — wheels subtracted by arch cutouts.** Restructure so the `<G mask="url(#dameRideCutouts)">` group contains ONLY the car body `<Path>` and the dome `<Path>` (both `fill={color}`). Move the two wheel `<Circle>` elements and the smile `<Path>` OUT of the masked group, rendering them AFTER it as unmasked siblings, each `fill={color}`. This reproduces the source SVG paint order (body → dome → cutouts → wheels-on-top → smile).
- [x] 6.4 `rg -n "764 900" src/components/DameRideLogo.tsx` still returns at least one match (smile typo fix preserved); `rg -n "764900" src` returns zero matches.
- [x] 6.5 Static structural check: the two wheel `<Circle>` elements and the smile `<Path>` are NOT descendants of the `<G mask="url(#dameRideCutouts)">` element; the masked `<G>` has exactly two element children (body path + dome path).
- [x] 6.6 `npx tsc --noEmit` (via `npm run validate`) exits 0.
- [ ] 6.7 Cold-launch on iOS + Android (manual QA, owned by parent): logo is centered within its square (not top-heavy/small); each wheel is a solid orange circle on top of its arch (a thin transparent crescent "wheel well" shows between wheel and body), NOT a crescent-shaped wheel; window + both arches are transparent; smile is solid orange.
