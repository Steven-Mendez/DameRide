# Almacenamiento

DameRide usa Supabase Storage para imágenes de perfil y vehículos.

## Buckets

| Bucket | Uso | Público | Límite | MIME types |
| --- | --- | --- | --- | --- |
| `avatars` | Avatar del perfil | Sí | 1 MiB | `image/jpeg`, `image/png`, `image/webp` |
| `vehicles` | Foto del vehículo | Sí | 2 MiB | `image/jpeg`, `image/png`, `image/webp` |

## Archivos de Código

- `src/lib/storage.ts` centraliza uploads y eliminación de avatar.
- `app/profile/edit.tsx` selecciona/sube avatar.
- `app/profile/vehicle.tsx` toma o selecciona foto de vehículo.

## Convención de Rutas

```txt
<user-id>/avatar-<timestamp>.jpg
<user-id>/<vehicle-id-or-new>-<timestamp>.jpg
```

Esto permite políticas basadas en `storage.foldername(name)[1] = auth.uid()`.

## Políticas

Las migraciones crean políticas para lectura pública y escritura autenticada por carpeta de usuario. En avatars también se documenta eliminación del archivo anterior cuando se remueve el avatar del perfil.

## Seguridad

Los buckets son públicos por diseño para mostrar imágenes en la app. Si el producto cambia y requiere privacidad, habría que cambiar buckets, URLs y políticas.
