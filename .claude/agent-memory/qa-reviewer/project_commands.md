---
name: project-commands
description: Verification commands for the RideTogether Expo React Native project
metadata:
  type: reference
---

RideTogether is an Expo / React Native app (package name `dameride`).

- Typecheck: `npm run typecheck` (runs `tsc --noEmit`)
- `npm run validate` is also used in tasks to run typecheck (per tasks.md conventions)
- No simulator/emulator available in the agent environment — cold-launch / visual QA is deferred to the parent and owned manually.
- `react-native-svg` is pinned at `^15.12.1`.
