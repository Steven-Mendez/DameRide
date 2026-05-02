# Instalación

## Requisitos

- Node.js y npm instalados.
- Acceso a `npx expo` para iniciar la app.
- Acceso a `npx supabase` si se usará Supabase local.
- Expo Go, emulador/simulador o una development build.
- Archivo `.env` configurado a partir de `.env.example`.

## Instalar Dependencias

```bash
npm install
```

## Configurar Variables

Crea `.env` tomando como base `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback

GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

No guardes secretos reales en documentación ni commits.

## Backend Local Opcional

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:status
```

Luego copia la URL local y la anon key local al `.env`.

## Iniciar la App

```bash
npm run start
```

Si necesitas probar en un dispositivo físico con red restrictiva o resolver problemas de OAuth:

```bash
npx expo start --tunnel
```

Usa `--clear` solo para limpiar caché de Metro cuando haya errores extraños:

```bash
npx expo start --tunnel --clear
```
