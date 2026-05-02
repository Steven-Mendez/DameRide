# Variables de Entorno

DameRide usa Expo, por lo que las variables disponibles para el cliente móvil deben usar el prefijo `EXPO_PUBLIC_`.

## Variables Públicas

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback
```

| Variable | Uso |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Llave anon/publishable para cliente móvil. |
| `EXPO_PUBLIC_APP_SCHEME` | Scheme de deep link de la app. |
| `EXPO_PUBLIC_AUTH_REDIRECT_URL` | Redirect para Auth/OAuth en builds con scheme. |

## Variables Privadas

```bash
GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

Estas variables se usan para configurar Google OAuth en Supabase CLI local. No deben exponerse en el cliente móvil.

## Variables Prohibidas en Cliente

No agregues `SUPABASE_SERVICE_ROLE_KEY` ni cualquier secret key al cliente React Native. Esa llave tiene privilegios administrativos y debe permanecer solo en entornos server-side seguros.

## Archivos

- `.env.example` documenta nombres sin valores reales.
- `.env` contiene valores locales y está ignorado por Git.
