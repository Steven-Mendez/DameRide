# Tasks: Refine Login Hero Spacing

This is a single-file, polish-level change. All edits are confined to `app/(auth)/login.tsx`. Work top-down.

## Phase 1 — Edit the hero block

- [x] 1.1 Open `app/(auth)/login.tsx`. Locate the outer screen container at line 54: `<View className="px-5 gap-4 pt-2">`. Change its classes to `px-5 gap-3 pt-1`.
- [x] 1.2 Locate the hero stack `<View className="items-center gap-3">` (currently line 55). Change its classes to `items-center gap-2`.
- [x] 1.3 Locate the logo row `<View className="flex-row items-center justify-center py-8">` (currently line 56). Change `py-8` to `py-4`. Leave the rest of the className intact. The inner `<DameRideLogo size={140} accessibilityLabel="DameRide" />` is unchanged.
- [x] 1.4 Remove the entire intermediate `<View className="items-center gap-1">` wrapper (currently lines 60–67) AND the `<Text className="font-jakarta-extrabold text-[30px] text-on-surface text-center tracking-tight">DameRide</Text>` node inside it. Hoist the tagline `<Text>` (`Comparte tu ruta, ahorra dinero y viaja acompañado.`) out so it sits as a direct child of the `items-center gap-2` hero stack, with its existing className `font-jakarta text-sm text-on-surface-variant text-center max-w-[290px] leading-5` preserved verbatim.

## Phase 2 — Verification (text)

- [x] 2.1 Run `rg -n 'font-jakarta-extrabold text-\[30px\]' app/\(auth\)/login.tsx` and confirm zero matches.
- [x] 2.2 Run `rg -n '>DameRide<' app/\(auth\)/login.tsx` and confirm zero matches. (The `accessibilityLabel="DameRide"` on the logo MUST still appear in a separate `rg -n 'accessibilityLabel="DameRide"' app/\(auth\)/login.tsx` check.)
- [x] 2.3 Run `rg -n 'Comparte tu ruta, ahorra dinero y viaja acompañado.' app/\(auth\)/login.tsx` and confirm exactly one match.
- [x] 2.4 Run `rg -n 'px-5 gap-3 pt-1' app/\(auth\)/login.tsx` and confirm one match.
- [x] 2.5 Run `rg -n 'items-center gap-2' app/\(auth\)/login.tsx` and confirm at least one match (the hero stack).
- [x] 2.6 Run `rg -n 'py-4' app/\(auth\)/login.tsx` and confirm the logo row's match.
- [x] 2.7 Run `rg -n 'SafeAreaView|KeyboardAvoidingView|keyboardShouldPersistTaps|paddingBottom: 40' app/\(auth\)/login.tsx` and confirm all four pieces of the scroll structure are still present.
- [x] 2.8 Run `npx tsc --noEmit` and confirm no new errors.

## Phase 3 — Manual QA

- [ ] 3.1 iOS simulator, iPhone 17 Pro, keyboard closed: confirm the auth card top edge sits in the upper 50 % of the screen and the hero no longer reads "airy". Take a screenshot for the PR.
- [ ] 3.2 iOS simulator, iPhone 17 Pro, focus the password input so the keyboard opens: confirm the "Iniciar sesion" button remains fully tappable above the keyboard with no clipping.
- [ ] 3.3 iOS simulator, iPhone SE: confirm the hero (logo + tagline) is fully visible above the auth card with no horizontal overflow. If the hero feels too tight, change the logo row's `py-4` to `py-5` and re-check 3.1 and 3.2.
- [ ] 3.4 Android emulator (any modern size): repeat 3.1 and 3.2. Confirm no platform-specific regression.
- [ ] 3.5 In all four runs above, verify the Spanish copy is verbatim and the divider row "o inicia con correo" still reads correctly with the lines on either side.

## Phase 4 — PR notes

- [ ] 4.1 In the PR description, record:
  - The final `py-*` value used on the logo row (whether `py-4` or `py-5` per 3.3).
  - Whether QA perceived the inputs as still cramped relative to the buttons after the hero tightened (signal for a follow-up `gap-4` → `gap-5` bump on the inputs wrapper).
  - Screenshots of the before/after on iPhone 17 Pro and iPhone SE.
