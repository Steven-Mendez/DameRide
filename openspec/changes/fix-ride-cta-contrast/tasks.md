# Tasks: Fix Ride CTA Contrast

This is a single-file, two-class-swap color correction. All production edits are confined to `src/components/RideCard.tsx`. Work top-down.

## Phase 1 — Edit the CTA color treatment

- [x] 1.1 Open `src/components/RideCard.tsx`. Locate the CTA `<TouchableOpacity>` (the block under the `{/* CTA */}` comment, currently lines ~110–119). In its `className`, replace `bg-primary-container` with `bg-primary`. Leave every other class in that string (`w-full`, `py-3`, `rounded-xl`, `items-center`, `mt-1`) byte-identical and in the same order.
- [x] 1.2 In the same block, on the label `<Text>` (currently line ~116), replace `text-on-primary-container` with `text-on-primary`. Leave `font-jakarta-bold` and `text-sm` byte-identical and in the same order. Do not touch `{actionLabel}`.
- [x] 1.3 Confirm `onPress={() => router.push(`/ride/${ride.id}`)}` and `activeOpacity={0.7}` are untouched, and the `actionLabel` prop default (`'Ver detalles y reservar'`) is untouched.

## Phase 2 — Verification (text)

- [x] 2.1 Run `rg -n "bg-primary-container" src/components/RideCard.tsx` and confirm zero matches.
- [x] 2.2 Run `rg -n "text-on-primary-container" src/components/RideCard.tsx` and confirm zero matches.
- [x] 2.3 Run `rg -n "w-full py-3 bg-primary rounded-xl items-center mt-1" src/components/RideCard.tsx` and confirm exactly one match.
- [x] 2.4 Run `rg -n "font-jakarta-bold text-sm text-on-primary\b" src/components/RideCard.tsx` and confirm exactly one match (and that it is the CTA label).
- [x] 2.5 Run `git diff src/constants/theme.ts tailwind.config.js` and confirm both diffs are empty.
- [x] 2.6 Run `git diff --name-only` and confirm `src/components/RideCard.tsx` is the only production file listed.
- [x] 2.7 Run `npm run validate` and confirm it exits 0 (lint + typecheck, no new errors).

## Phase 3 — Manual visual QA (Buscar tab)

- [ ] 3.1 DEFERRED (manual on-device QA, not executable in headless agent env). Static reasoning: `bg-primary` → `Colors.primary` `#FF6B1A`, `text-on-primary` → `Colors.onPrimary` `#FFFFFF` (verified in `src/constants/theme.ts`); CTA now renders solid orange fill + white label.
- [ ] 3.2 DEFERRED (manual on-device QA, not executable in headless agent env). Static reasoning: CTA now uses the identical `bg-primary` / `text-on-primary` pairing already used by `app/(auth)/login.tsx` and `src/components/Button.tsx` `variant="primary"`, so prominence matches.
- [ ] 3.3 DEFERRED (manual on-device QA, not executable in headless agent env). Static reasoning: `onPress={() => router.push(`/ride/${ride.id}`)}` is byte-unchanged — navigation behavior cannot regress from a className-only swap.

## Phase 4 — PR notes

- [ ] 4.1 DEFERRED (no commit/PR requested for this task). For the eventual PR description: include the before/after Buscar-tab screenshot and note explicitly that `app/index.tsx`'s `*-container` CTAs were left unchanged on purpose (placeholder behind the splash, not user-visible) so a reviewer doesn't flag it as missed.
