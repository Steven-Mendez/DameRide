# Authentication

Authentication is implemented with Supabase Auth. The app combines email/password, Google OAuth, and its own state layer through `AuthProvider`.

## Relevant Files

| File | Responsibility |
| --- | --- |
| `src/lib/auth.ts` | Registration, login, logout, and session/user reads. |
| `src/hooks/useAuth.tsx` | Session, user, and profile context. |
| `src/features/auth/services/googleAuth.ts` | Google OAuth flow. |
| `app/(auth)/login.tsx` | Login screen. |
| `app/(auth)/register.tsx` | Registration screen. |
| `app/_layout.tsx` | Session/onboarding guards and redirects. |

## Email and Password

Registration uses `supabase.auth.signUp` and sends profile metadata. Login uses `supabase.auth.signInWithPassword`.

## Google OAuth

The flow uses `signInWithOAuth`, `skipBrowserRedirect: true`, `WebBrowser.openAuthSessionAsync`, code/token extraction, and `exchangeCodeForSession` or `setSession`.

In Expo Go, the redirect can depend on LAN/tunnel mode. If LAN fails, try:

```bash
npx expo start --tunnel
```

## Onboarding

After authentication, the app checks `profile.onboarding_completed_at`. If it is empty, it redirects to `app/onboarding.tsx`. Once minimum data is completed, the timestamp is saved and the user can enter the tab navigation.

## Security

- The session is persisted with AsyncStorage on native platforms.
- The app must not use the service-role key.
- Sensitive actions rely on RLS and RPC validations.
- Google Client Secret is private and configured in Supabase Dashboard or local Supabase CLI.
