# Fix Ride CTA Contrast

## Why

On the "Buscar" tab, every ride result is a `<RideCard>` whose primary call-to-action — the "Ver detalles y reservar" button — is rendered with a pale peach fill that reads as a *disabled* button. The user, looking at a screenshot of the Buscar tab, reported: "I dont like orange color of the buttons, feels disable[d]." This is the primary conversion action on the search surface (it is what takes a rider into the ride detail / reservation flow), so a CTA that looks inactive directly suppresses the core funnel.

This is a perceived-affordance defect, not a copy or behavior problem. The button is fully functional; it just doesn't *look* tappable.

## Root Cause

Already investigated — not to be re-investigated. In `src/components/RideCard.tsx` (the CTA block at lines ~110–119) the button is rendered as:

```tsx
<TouchableOpacity
  className="w-full py-3 bg-primary-container rounded-xl items-center mt-1"
  activeOpacity={0.7}
  onPress={() => router.push(`/ride/${ride.id}`)}
>
  <Text className="font-jakarta-bold text-sm text-on-primary-container">
    {actionLabel}
  </Text>
</TouchableOpacity>
```

- `bg-primary-container` maps to `Colors.primaryContainer` = `#FFD7BF` — a pale peach. Against the white card it has very low contrast and reads as an inactive/disabled surface.
- `text-on-primary-container` maps to `Colors.onPrimaryContainer` = `#5A1F00` — dark brown.

By contrast, the app's *actual* primary CTAs use the solid brand treatment:

- `app/(auth)/login.tsx` — "Crear cuenta" / "Iniciar sesion".
- The shared `src/components/Button.tsx` `variant="primary"`.

Both use `bg-primary` (`Colors.primary` = `#FF6B1A`, solid brand orange) with `text-on-primary` (`Colors.onPrimary` = `#FFFFFF`, white). That pairing reads as clearly active and prominent. The ride card CTA is the only primary action in the app using the muted `primary-container` / `on-primary-container` pairing, which is why it visually disagrees with every other primary button and reads as disabled.

## What Changes

A single per-button color correction in `src/components/RideCard.tsx`:

- Swap the CTA's surface class `bg-primary-container` → `bg-primary` so it fills with the solid brand orange `#FF6B1A`.
- Swap the CTA's label class `text-on-primary-container` → `text-on-primary` so the label renders white `#FFFFFF`.

Nothing else on the button changes:

- The button keeps its existing size/shape/layout classes: `w-full`, `py-3`, `rounded-xl`, `items-center`, `mt-1`.
- The label keeps `font-jakarta-bold text-sm` and continues to render `actionLabel` (default `"Ver detalles y reservar"`).
- `activeOpacity={0.7}` and `onPress={() => router.push(`/ride/${ride.id}`)}` are unchanged. No navigation or behavior change.

## How

The Tailwind tokens `bg-primary` and `text-on-primary` already exist and are already consumed by `app/(auth)/login.tsx` and `src/components/Button.tsx`, so this is a class-string swap only — no new tokens, no config edits.

`src/constants/theme.ts` is **not** touched. The values of `Colors.primary` and `Colors.primaryContainer` are unchanged globally. `primaryContainer` is still a valid token used elsewhere (e.g. chips/badges); this change does not deprecate it — it just stops the ride card CTA from using it for a primary action.

The end-state CTA block is:

```tsx
<TouchableOpacity
  className="w-full py-3 bg-primary rounded-xl items-center mt-1"
  activeOpacity={0.7}
  onPress={() => router.push(`/ride/${ride.id}`)}
>
  <Text className="font-jakarta-bold text-sm text-on-primary">
    {actionLabel}
  </Text>
</TouchableOpacity>
```

## Scope

In scope:

- The two class swaps in the CTA block of `src/components/RideCard.tsx`.
- `npm run validate` (runs `npm run lint && npm run typecheck`).
- Manual visual QA on the Buscar tab.

## Non-Goals

- **No token / palette change.** `src/constants/theme.ts` and `tailwind.config.js` are not edited. `Colors.primary` and `Colors.primaryContainer` keep their current values. This is a per-button correction, not a rebrand.
- **No behavior or navigation change.** `onPress`, `activeOpacity`, the `actionLabel` prop and its default, and the destination route `/ride/${ride.id}` are all unchanged.
- **No disabled/loading state work.** This CTA currently has no `disabled` and no loading state. None is added; none can regress because none exists. (This is called out so a reviewer doesn't expect a disabled-state requirement.)
- **`app/index.tsx` is intentionally NOT changed.** Its "Buscar viaje" / "Publicar viaje" CTAs (lines ~86–108) also use `bg-primary-container` / `bg-secondary-container`. Because `index.tsx` is now an obscured placeholder behind the splash (per the recently shipped navigator fix), it is not user-visible in the normal flow, so changing it is out of scope here. See the NOTE in the spec delta — it is logged for future palette-consistency awareness, not because it was missed.
- **No changes to other `<RideCard>` content** (route text, time, seat count, layout) or to any other consumer of `RideCard`.

## Risks and Mitigations

- **Risk: a reviewer thinks `app/index.tsx` was missed.** Mitigation: the spec delta carries an explicit NOTE documenting that `index.tsx`'s `*-container` CTAs are knowingly out of scope because that screen is not user-visible behind the splash.
- **Risk: the CTA now visually competes with other on-card elements.** Mitigation: this is the intended outcome — the CTA *should* be the most prominent element on the card; it currently is the least. Manual QA on the Buscar tab confirms the card still reads cleanly.
- **Risk: a hidden disabled state somewhere relies on the muted look.** Mitigation: verified — `RideCard` has no `disabled` prop and the CTA has no conditional styling. There is no state that depended on the pale fill.

## Acceptance Criteria

1. In `src/components/RideCard.tsx`, the CTA `<TouchableOpacity>`'s className is `w-full py-3 bg-primary rounded-xl items-center mt-1` (the substring `bg-primary-container` no longer appears anywhere in the file).
2. In `src/components/RideCard.tsx`, the CTA label `<Text>`'s className is `font-jakarta-bold text-sm text-on-primary` (the substring `text-on-primary-container` no longer appears anywhere in the file).
3. On the Buscar tab, every ride card's CTA renders with a solid `#FF6B1A` fill and white label text, and is visually indistinguishable in "activeness" from the login screen's "Iniciar sesion" / "Crear cuenta" primary buttons.
4. The CTA's `onPress`, `activeOpacity={0.7}`, layout classes (`w-full py-3 rounded-xl items-center mt-1`), and label content (`actionLabel`, default `"Ver detalles y reservar"`) are unchanged from before the change.
5. `git diff src/constants/theme.ts tailwind.config.js` is empty.
6. `git diff --name-only` shows `src/components/RideCard.tsx` as the only production file changed by this change.
7. `npm run validate` exits 0 (lint and typecheck pass with no new errors).

## Open Questions

None blocking.
