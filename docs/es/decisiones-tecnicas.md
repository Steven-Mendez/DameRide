# Decisiones Técnicas

## Expo Router

La navegación usa rutas por archivo en `app/`. Esto simplifica tabs, rutas de auth, pantallas modales y rutas dinámicas como `ride/[id]`.

## Supabase Como Backend

Supabase concentra Auth, Postgres, Storage y Realtime. Esta decisión permite un backend completo con migraciones SQL y tipos generados para TypeScript.

## RLS y RPCs Para Reservas

Las reservas usan funciones SQL (`reserve_seat`, `cancel_reservation`) para mantener consistencia: validar usuario autenticado, bloquear filas, evitar overbooking y restaurar cupos al cancelar.

## PostGIS Para Búsqueda Cercana

Los viajes guardan coordenadas y columnas geography. La búsqueda cercana se resuelve en base de datos mediante `st_dwithin` y distancia.

## Storage Público Controlado por Carpeta

Los buckets de imágenes son públicos para facilitar renderizado en la app, pero las escrituras se restringen a carpetas cuyo primer segmento es el `auth.uid()`.

## Tipos Separados

El proyecto mantiene `src/types/database.ts` para tipos de dominio usados por UI y `src/types/supabase.ts` para tipos generados desde la base.

## Sin Seeds en Recovery

La seed fue removida para que `supabase/` sea una fuente limpia de reconstrucción de infraestructura y no mezcle datos de prueba con migraciones.

