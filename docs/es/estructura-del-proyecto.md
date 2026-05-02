# Estructura del Proyecto

```txt
DameRide/
├── app/
├── assets/
├── docs/es/
├── scripts/
├── src/
├── supabase/
├── app.json
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## `app/`

| Ruta | Propósito |
| --- | --- |
| `app/_layout.tsx` | Layout raíz, fuentes, splash y redirecciones por auth/onboarding. |
| `app/index.tsx` | Pantalla inicial/redirección según sesión. |
| `app/onboarding.tsx` | Completar perfil y registrar vehículo opcional. |
| `app/(auth)/login.tsx` | Login con Google y correo. |
| `app/(auth)/register.tsx` | Registro con correo. |
| `app/(tabs)/buscar.tsx` | Búsqueda de viajes. |
| `app/(tabs)/publicar.tsx` | Publicación de viajes. |
| `app/(tabs)/reservas.tsx` | Reservas y viajes publicados. |
| `app/(tabs)/perfil.tsx` | Perfil, contacto y acciones de cuenta. |
| `app/ride/[id].tsx` | Detalle y reserva de viaje. |
| `app/profile/edit.tsx` | Edición de perfil y avatar. |
| `app/profile/vehicle.tsx` | Crear/editar vehículo y foto. |

## `src/`

| Carpeta | Propósito |
| --- | --- |
| `src/components/` | Componentes visuales reutilizables. |
| `src/constants/` | Tema visual y rutas populares de Nicaragua. |
| `src/features/auth/` | Google OAuth. |
| `src/hooks/` | AuthProvider y hooks Realtime. |
| `src/lib/` | Cliente Supabase, auth, consultas y storage. |
| `src/types/` | Tipos de dominio y tipos generados. |
| `src/utils/` | Formateo, avatar y cálculo de rutas. |

## `supabase/`

Contiene `config.toml`, migraciones SQL y documentación de recuperación del backend. Las seeds fueron eliminadas; la reconstrucción limpia crea estructura, no datos de prueba.
