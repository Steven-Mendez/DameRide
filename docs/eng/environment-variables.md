# Environment Variables

DameRide uses Expo, so variables available to the mobile client must use the `EXPO_PUBLIC_` prefix.

## Public Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback
```

| Variable | Use |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile client anon/publishable key. |
| `EXPO_PUBLIC_APP_SCHEME` | App deep link scheme. |
| `EXPO_PUBLIC_AUTH_REDIRECT_URL` | Auth/OAuth redirect for scheme-based builds. |

## Private Variables

```bash
GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

These variables configure Google OAuth in local Supabase CLI. They must not be exposed in the mobile client.

## Variables Forbidden in the Client

Do not add `SUPABASE_SERVICE_ROLE_KEY` or any secret key to the React Native client. That key has administrative privileges and must only be used in secure server-side environments.

## Files

- `.env.example` documents variable names without real values.
- `.env` contains local values and is ignored by Git.
