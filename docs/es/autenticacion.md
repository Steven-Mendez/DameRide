# Autenticación

La autenticación se implementa con Supabase Auth. La app combina email/password, Google OAuth y una capa de estado propia en `AuthProvider`.

## Archivos Relevantes

| Archivo | Responsabilidad |
| --- | --- |
| `src/lib/auth.ts` | Registro, login, logout y lectura de sesión/usuario. |
| `src/hooks/useAuth.tsx` | Contexto de sesión, usuario y perfil. |
| `src/features/auth/services/googleAuth.ts` | Flujo OAuth con Google. |
| `app/(auth)/login.tsx` | Pantalla de login. |
| `app/(auth)/register.tsx` | Pantalla de registro. |
| `app/_layout.tsx` | Guardas y redirecciones por sesión/onboarding. |

## Email y Contraseña

El registro usa `supabase.auth.signUp` y envía metadata de perfil. El login usa `supabase.auth.signInWithPassword`.

## Google OAuth

El flujo usa `signInWithOAuth`, `skipBrowserRedirect: true`, `WebBrowser.openAuthSessionAsync`, extracción de `code`/tokens y `exchangeCodeForSession` o `setSession`.

En Expo Go, el redirect puede depender de LAN/tunnel. Si LAN falla, prueba:

```bash
npx expo start --tunnel
```

## Onboarding

Después de autenticarse, la app verifica `profile.onboarding_completed_at`. Si está vacío, redirige a `app/onboarding.tsx`. Al completar datos mínimos, guarda la fecha y permite entrar a tabs.

## Seguridad

- La sesión se persiste en AsyncStorage para nativo.
- La app no debe usar service-role key.
- Las acciones sensibles dependen de RLS y RPCs.
- Google Client Secret es privado y se configura en Supabase/Dashboard o Supabase CLI local.
