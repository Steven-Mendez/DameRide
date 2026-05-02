# Build and Release

## Expo Export

```bash
npm run export
```

This command runs `expo export` and works as an export smoke test.

## Platform Startup

```bash
npm run android
npm run ios
npm run web
```

## Release Checklist

- Review that the MIT license remains suitable for the way the project will be distributed.
- Confirm final OAuth redirect URLs.
- Define production domains/deep links.
- Configure final Google OAuth accounts.
- Review Supabase RLS policies and advisors.
- Create EAS Build configuration if the app will be published to stores.
- Review location, camera, and gallery permissions in `app.json`.
