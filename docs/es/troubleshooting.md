# Troubleshooting

## Google Login No Regresa a la App

Verifica el redirect impreso en consola por `src/features/auth/services/googleAuth.ts`:

```txt
Google auth redirect URL: ...
```

Ese redirect debe estar permitido en Supabase Dashboard. Si estás en Expo Go y LAN falla, prueba:

```bash
npx expo start --tunnel
```

## Cambios No Se Reflejan

Limpia caché de Metro solo cuando sea necesario:

```bash
npx expo start --clear
```

O con túnel:

```bash
npx expo start --tunnel --clear
```

## Supabase No Está Configurado

Si ves errores de configuración, revisa `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Storage Falla al Subir Imágenes

Revisa que existan los buckets `avatars` y `vehicles`, que acepten el MIME type de la imagen y que las políticas permitan escribir dentro de la carpeta del usuario autenticado.

## No Aparecen Viajes Cercanos

Revisa que los viajes tengan `origin_lat`, `origin_lng`, `destination_lat` y `destination_lng`. Las columnas geography se hidratan por trigger y la búsqueda cercana usa `search_rides_nearby`.

## Tipos de Supabase Desactualizados

```bash
npm run supabase:types
```

## Push a Proyecto Remoto Existente

No apliques migraciones a la nube actual sin reconciliar historial. La documentación de `supabase/README.md` indica que el proyecto hosted tiene historial propio.
