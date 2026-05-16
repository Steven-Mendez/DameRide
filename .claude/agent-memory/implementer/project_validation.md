---
name: project-validation
description: How to validate code changes in the RideTogether Expo app (lint + typecheck; no test runner)
metadata:
  type: project
---

`npm run validate` runs `expo lint` then `tsc --noEmit`. This is the only gate — there is **no test runner / no jest** in this project (confirmed: no test script in package.json, devDeps are eslint/typescript only).

**Why:** It's an Expo Router 6 / SDK 54 React Native app; correctness is enforced by TypeScript + eslint-config-expo, plus manual device QA for navigation/UI behavior.

**How to apply:** After code edits, run `npm run validate` and treat exit 0 as the automated bar. QA steps in OpenSpec `tasks.md` that say "Manual QA" / launch on simulator cannot be executed in a headless agent environment — mark them DEFERRED with a note rather than checking them. Static reasoning can still satisfy verification-by-grep tasks.
