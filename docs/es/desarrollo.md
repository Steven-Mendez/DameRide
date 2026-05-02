# Desarrollo

## Flujo Recomendado

1. Instalar dependencias.
2. Configurar `.env`.
3. Levantar Supabase local o apuntar a un proyecto Supabase existente.
4. Iniciar Expo.
5. Validar con lint y TypeScript antes de entregar cambios.

## Comandos

```bash
npm install
npm run start
npm run validate
```

## Expo Tunnel

El modo LAN es más rápido, pero el túnel puede ser necesario para probar en dispositivo físico o cuando Google OAuth no regresa correctamente en la red local:

```bash
npx expo start --tunnel
```

## Supabase Local

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:status
npm run supabase:types
```

## Tipos

Después de cambios en migraciones, regenera tipos con:

```bash
npm run supabase:types
```

