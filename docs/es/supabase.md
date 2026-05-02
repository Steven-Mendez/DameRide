# Supabase

DameRide usa Supabase como backend principal. El cliente está en `src/lib/supabase.ts` y se inicializa de forma lazy para evitar problemas durante renderizados estáticos.

## Cliente Supabase

Variables usadas por el cliente móvil:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

En nativo, la sesión se persiste con AsyncStorage. En web se usa el storage por defecto del navegador. `detectSessionInUrl` está desactivado porque el flujo OAuth procesa manualmente la respuesta.

## Auth

Se usa Supabase Auth para email/password y Google OAuth. El trigger `on_auth_user_created` crea el perfil inicial en `profiles`.

## Database

Tablas de app:

- `profiles`
- `vehicles`
- `rides`
- `reservations`
- `ratings`

La app accede a la base mediante `src/lib/database.ts`.

## Storage

| Bucket | Uso | Público | Límite | MIME types |
| --- | --- | --- | --- | --- |
| `avatars` | Fotos de perfil | Sí | 1 MiB | JPEG, PNG, WebP |
| `vehicles` | Fotos de vehículos | Sí | 2 MiB | JPEG, PNG, WebP |

## Row Level Security

RLS está habilitado en tablas públicas de app. Las políticas permiten lectura pública donde el producto lo necesita y restringen escritura al dueño: perfiles propios, vehículos propios, viajes propios y reservas del pasajero.

## Migraciones

Las migraciones viven en `supabase/migrations/` e incluyen extensiones, tablas, constraints, índices, funciones, triggers, RLS, Storage y Realtime. No se debe aplicar la cadena limpia de migraciones contra el proyecto hosted actual sin reconciliar el historial remoto.

## Seeds

No hay seed activo. `supabase/seed.sql` fue eliminado y `supabase/config.toml` tiene seeds desactivadas. La reconstrucción limpia crea estructura, no datos runtime.

## Tipos Generados

`src/types/supabase.ts` se genera desde Supabase local con:

```bash
npm run supabase:types
```

## Variables Públicas

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback
```

## Variables Privadas

```bash
GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

Estas variables son para configuración local del proveedor Google en Supabase CLI y no deben exponerse en el cliente móvil.

## Seguridad en Cliente Móvil

- Solo usar anon/publishable key en Expo.
- Nunca incluir `SUPABASE_SERVICE_ROLE_KEY` en React Native.
- No documentar secretos reales.
- Mantener reglas RLS como control principal de acceso.
- Revisar OAuth y redirect URLs en Dashboard para cada ambiente.
