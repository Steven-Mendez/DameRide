# Refine Login Hero Spacing

## Why

The login screen at `app/(auth)/login.tsx` currently shows the brand twice in its hero — a 140 px `<DameRideLogo>` inside a `py-8` row, then immediately below it a separate 30 px "DameRide" wordmark `<Text>`. The double brand expression combined with the generous vertical padding (`py-8` on the logo row + a `gap-3` outer stack + a `gap-1` inner stack) pushes the auth card down the screen. On an iPhone 17 Pro the result is a top half that reads airy and a bottom half where the form card sits cramped against the keyboard-safe area. The user's screenshot confirms this asymmetry.

The intent is a polish-level refinement: tighten the hero so the form sits higher and the available vertical space is used more evenly. This is layout/spacing only — no token changes, no copy changes (with one narrow exception, below), no structural refactor.

## What Changes

- **Drop the redundant "DameRide" wordmark `<Text>`** in `app/(auth)/login.tsx` (currently lines 60–63). The `<DameRideLogo>` already conveys the brand and carries an `accessibilityLabel="DameRide"`, so the screen still announces the brand to screen readers. Removing the wordmark — rather than shrinking the logo — collapses an entire text node and its gap in one move, which is the largest single contributor to the top-half airiness. The logo stays at `size={140}` so the brand expression is unchanged for sighted users.
- **Tighten the hero vertical padding.** Replace the `py-8` (32 px top + 32 px bottom) on the logo's row container with `py-4` (16 px / 16 px). Reduce the outer hero stack's `gap-3` (12 px) to `gap-2` (8 px), since with the wordmark removed there are now only two children (logo, tagline) and the tighter gap reads more intentional.
- **Bring the auth card closer to the hero.** The outer screen container is currently `px-5 gap-4 pt-2`. Change to `px-5 gap-3 pt-1` so the card starts ~12 px higher on the screen. `pt-2` → `pt-1` removes the small top breathing room that mostly compounded with the SafeArea inset; `gap-4` → `gap-3` shaves another 4 px between the hero and the card.
- **Tighten the auth card's internal divider gap (and only that).** Inside the card, the "o inicia con correo" divider row currently uses `py-1` (4 px / 4 px). Leave it. The card's outer `gap-3` and the inputs' `gap-4` stay as-is — input fields already breathe well; only the hero stack was the problem. (Original brief mentioned tightening internal spacing as optional; conservative call is to leave inputs alone and let the hero changes do the work.)
- **No copy changes** other than the wordmark `<Text>` removal described above. The tagline `"Comparte tu ruta, ahorra dinero y viaja acompañado."` stays verbatim. All button labels, input labels, placeholders, and the divider string stay verbatim.
- **No token, color, or component-API changes.** `<DameRideLogo>` is rendered with the same props. `Colors`, `Shadows`, and the Tailwind config are untouched.

## How

In `app/(auth)/login.tsx`, the hero block (lines 54–68 in the pre-change file) is the only meaningful edit. The diff is roughly:

```tsx
// before
<View className="px-5 gap-4 pt-2">
  <View className="items-center gap-3">
    <View className="flex-row items-center justify-center py-8">
      <DameRideLogo size={140} accessibilityLabel="DameRide" />
    </View>

    <View className="items-center gap-1">
      <Text className="font-jakarta-extrabold text-[30px] text-on-surface text-center tracking-tight">
        DameRide
      </Text>
      <Text className="font-jakarta text-sm text-on-surface-variant text-center max-w-[290px] leading-5">
        Comparte tu ruta, ahorra dinero y viaja acompañado.
      </Text>
    </View>
  </View>
  …
</View>

// after
<View className="px-5 gap-3 pt-1">
  <View className="items-center gap-2">
    <View className="flex-row items-center justify-center py-4">
      <DameRideLogo size={140} accessibilityLabel="DameRide" />
    </View>

    <Text className="font-jakarta text-sm text-on-surface-variant text-center max-w-[290px] leading-5">
      Comparte tu ruta, ahorra dinero y viaja acompañado.
    </Text>
  </View>
  …
</View>
```

The `<View className="items-center gap-1">` wrapper around the (now-single) tagline is collapsed because it has only one child.

The `SafeAreaView` + `KeyboardAvoidingView` + `ScrollView` structure (lines 44–53, 125–127) is **not** touched. `contentContainerStyle={{ paddingBottom: 40 }}`, `keyboardShouldPersistTaps="handled"`, and the `behavior` switch on `KeyboardAvoidingView` all stay byte-identical.

## Scope

In scope:
- The hero edit described above in `app/(auth)/login.tsx`.
- A `npx tsc --noEmit` check.
- Manual QA on iOS simulator (iPhone 17 Pro, iPhone SE) and one Android emulator size, with the keyboard open and closed.

## Non-Goals

- **Visual rebrand or token changes.** `src/constants/theme.ts` and `tailwind.config.js` are not touched.
- **Logo size change.** The logo stays at `size={140}`. The brief allowed shrinking the logo *or* dropping the wordmark; this change does the latter only.
- **Auth-card internal layout refactor.** `Input.tsx`, `Button.tsx`, `GoogleSignInButton`, the divider row, and the card's `gap-3` / inputs' `gap-4` are unchanged.
- **Register screen** (`app/(auth)/register.tsx`). Out of scope; its hero is text-only and is being refined separately if needed.
- **Spanish UI copy changes** (other than removing the redundant wordmark `<Text>` node itself — the underlying brand name still surfaces via the logo's `accessibilityLabel`).
- **Structural changes to `SafeAreaView` / `KeyboardAvoidingView` / `ScrollView`.** These must remain intact so the keyboard-open behavior on small devices is preserved.

## Risks and Mitigations

- **Brand legibility without the wordmark.** Sighted users who don't recognize the SVG mark may not know they're on a DameRide screen. Mitigation: the tagline `"Comparte tu ruta, ahorra dinero y viaja acompañado."` stays directly under the logo and the screen is the primary auth surface — first-run users arrive here from onboarding, where the brand has already been established. Screen-reader users continue to hear `"DameRide"` from the logo's `accessibilityLabel`.
- **Hero feels too compact on small devices.** With `py-4` instead of `py-8` and `pt-1` instead of `pt-2`, the iPhone SE may end up with the form too close to the SafeArea inset. Mitigation: QA on iPhone SE explicitly; if the hero reads too tight, the implementer is allowed to bump `py-4` to `py-5` (still meaningfully tighter than `py-8`) without revisiting this spec.
- **Keyboard-open regression.** The `KeyboardAvoidingView` + `ScrollView` combination handles small-device keyboard cases today. Mitigation: structure is untouched; the only deltas are class-name spacing values inside the scroll container.
- **Inputs no longer "breathe" relative to buttons.** The brief mentioned this as an option; this change deliberately defers it. If QA finds the card still feels cramped after the hero is tightened, a follow-up can bump inputs' `gap-4` → `gap-5` independently.

## Acceptance Criteria

QA can verify each line independently:

1. `app/(auth)/login.tsx` no longer contains the string `font-jakarta-extrabold text-[30px]` (the wordmark `<Text>`'s defining class).
2. `app/(auth)/login.tsx` no longer contains a `<Text>` node whose visible content is the literal `"DameRide"`. The logo's `accessibilityLabel="DameRide"` prop, by contrast, MUST still be present.
3. `app/(auth)/login.tsx` still imports `DameRideLogo` from `@/src/components/DameRideLogo` and renders `<DameRideLogo size={140} accessibilityLabel="DameRide" />` — same props as before.
4. The outer screen container's classes are `px-5 gap-3 pt-1` (was `px-5 gap-4 pt-2`).
5. The hero stack's classes are `items-center gap-2` (was `items-center gap-3`).
6. The logo row's classes are `flex-row items-center justify-center py-4` (was `… py-8`).
7. The tagline `"Comparte tu ruta, ahorra dinero y viaja acompañado."` is preserved verbatim and is rendered directly inside the hero stack (no longer wrapped in its own intermediate `items-center gap-1` `<View>`).
8. The Spanish strings `"Crear cuenta"`, `"o inicia con correo"`, `"Correo electrónico"`, `"Contraseña"`, `"Tu contraseña"`, `"tu@correo.com"`, and `"Iniciar sesion"` all appear verbatim, unchanged.
9. The `SafeAreaView` (`react-native-safe-area-context`), the `KeyboardAvoidingView` with its `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`, and the `ScrollView` with `contentContainerStyle={{ paddingBottom: 40 }}` and `keyboardShouldPersistTaps="handled"` all remain in place, in the same nesting order, byte-identical to pre-change.
10. The auth card's outer `<View>` classes (`bg-white rounded-[26px] p-4 border border-outline-variant/20 gap-3`) and its inline `style={Shadows.surface}` are unchanged.
11. The inputs' wrapper class `gap-4` is unchanged.
12. `npx tsc --noEmit` passes with no new errors.
13. On iOS simulator at iPhone 17 Pro size, with the keyboard closed, the auth card's top edge sits visibly higher on the screen than it did before the change (measured as: the card top starts within the upper 50 % of the screen, whereas pre-change it sat just below the vertical midpoint).
14. On iOS simulator at iPhone 17 Pro size, when the password input is focused and the keyboard is open, the "Iniciar sesion" button remains fully tappable above the keyboard (no clipping, no need to scroll).
15. On iOS simulator at iPhone SE size, the hero remains readable (logo + tagline both fully visible above the auth card without horizontal overflow) and the auth card's "Iniciar sesion" button is reachable with at most one short scroll when the keyboard is open.
16. On one Android emulator size, no layout regression vs. iOS — same hero spacing, same keyboard behavior.

## Open Questions

None blocking. Items the implementer should record in the PR description:
- Whether iPhone SE required bumping `py-4` to `py-5` per the mitigation above.
- Whether QA perceived the inputs as still cramped after the hero tightened (signal for the follow-up `gap-4` → `gap-5` bump).
