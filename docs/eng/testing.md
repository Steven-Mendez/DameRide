# Testing

## Static Validation

The repository includes static validation scripts for linting and TypeScript checking.

| Script | What it validates |
| --- | --- |
| `npm run lint` | ESLint with Expo configuration. |
| `npm run typecheck` | TypeScript without emitting files. |
| `npm run validate` | Runs lint and typecheck. |

## Main Command

```bash
npm run validate
```

## Export Smoke Test

```bash
npm run export
```

## Suggested Coverage

- Unit tests for utilities such as formatting, maps, and helpers.
- Integration tests for `src/lib/database.ts`.
- Tests for critical flows: login, onboarding, publishing, reserving, and canceling.
- End-to-end tests on device/emulator.
