# DameRide

DameRide es una app móvil desarrollada con Expo, React Native y Supabase para buscar, publicar y reservar viajes compartidos. El proyecto incluye autenticación, onboarding, perfiles, vehículos, mapas, búsqueda geoespacial, reservas, almacenamiento de imágenes y actualizaciones en tiempo real.

## Tecnologías Utilizadas

| Área | Tecnología |
| --- | --- |
| App móvil | Expo SDK 54, React Native 0.81, React 19 |
| Navegación | Expo Router |
| Lenguaje | TypeScript estricto |
| UI | NativeWind, Tailwind CSS, Plus Jakarta Sans, lucide-react-native |
| Backend | Supabase Auth, Postgres, PostGIS, Storage, Realtime |
| Mapas/rutas | react-native-maps, OSRM y Valhalla públicos |
| Validación | ESLint Expo, TypeScript |

## Características Principales

- Registro e inicio de sesión con correo y contraseña.
- Inicio de sesión con Google mediante Supabase OAuth.
- Onboarding para completar perfil y registrar vehículo opcional.
- Búsqueda de viajes por ruta, fecha, hora, radio y ordenamiento.
- Publicación de viajes con mapa, cupos, precio y notas.
- Reserva y cancelación de asientos.
- Perfil, contacto por WhatsApp y gestión de vehículos.
- Subida de avatar y fotos de vehículos a Supabase Storage.
- Actualizaciones en tiempo real para viajes y reservas.

## Requisitos

- Node.js y npm.
- Expo vía `npx expo`.
- Supabase CLI vía `npx supabase` si se usa backend local.
- Expo Go, emulador/simulador o development build.
- Proyecto Supabase configurado o stack local activo.

## Instalación

```bash
npm install
```

Copia `.env.example` a `.env` y completa los valores necesarios.

## Variables de Entorno

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_SCHEME=dameride
EXPO_PUBLIC_AUTH_REDIRECT_URL=dameride://auth/callback

GOOGLE_WEB_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=
```

Nunca incluyas secretos reales en commits o documentación. La app móvil solo debe usar llaves públicas/anon/publishable. No uses `SUPABASE_SERVICE_ROLE_KEY` en React Native.

## Ejecución en Desarrollo

```bash
npm run start
```

Si necesitas túnel para dispositivo físico u OAuth en redes restrictivas:

```bash
npx expo start --tunnel
```

Para limpiar caché de Metro solo cuando sea necesario:

```bash
npx expo start --tunnel --clear
```

## Scripts Disponibles

| Script | Descripción |
| --- | --- |
| `npm run start` | Inicia Expo. |
| `npm run android` | Inicia Expo abriendo Android. |
| `npm run ios` | Inicia Expo abriendo iOS. |
| `npm run web` | Inicia Expo para web. |
| `npm run lint` | Ejecuta ESLint con configuración Expo. |
| `npm run typecheck` | Ejecuta TypeScript sin emitir archivos. |
| `npm run validate` | Ejecuta lint y typecheck. |
| `npm run export` | Genera un export de Expo. |
| `npm run supabase:start` | Inicia Supabase local. |
| `npm run supabase:stop` | Detiene Supabase local. |
| `npm run supabase:status` | Muestra URLs y llaves locales. |
| `npm run supabase:reset` | Reconstruye la base local desde migraciones. |
| `npm run supabase:push` | Aplica migraciones a un proyecto remoto vinculado. |
| `npm run supabase:types` | Genera tipos TypeScript desde Supabase local. |

## Estructura del Proyecto

```txt
app/                 Pantallas y navegación con Expo Router
src/components/      Componentes reutilizables de UI y mapas
src/features/auth/   Flujo de inicio de sesión con Google
src/hooks/           Hooks de autenticación y realtime
src/lib/             Cliente Supabase, auth, database y storage
src/types/           Tipos de dominio y tipos generados de Supabase
src/utils/           Formato, avatar, mapas y rutas
supabase/            Configuración local, migraciones y documentación backend
docs/es/             Documentación del proyecto en español
```

## Documentación

Consulta la documentación completa en [`docs/es/indice.md`](docs/es/indice.md).

- [Introducción](docs/es/introduccion.md)
- [Instalación](docs/es/instalacion.md)
- [Configuración](docs/es/configuracion.md)
- [Arquitectura](docs/es/arquitectura.md)
- [Supabase](docs/es/supabase.md)
- [Base de datos](docs/es/base-de-datos.md)
- [Autenticación](docs/es/autenticacion.md)
- [Portafolio](docs/es/portafolio.md)

## Autoría y Créditos

- Desarrollo completo de la aplicación: Steven Mendez.
- Idea de negocio, diseño conceptual, flujos principales y guía funcional: Br. Vilma Paiz.
- Proyecto desarrollado para apoyar a Br. Vilma Paiz en su clase de Emprendimiento en la UAM Managua.
- Proyecto desarrollado como pieza de portafolio profesional.

## Licencia

Este proyecto es open source bajo la licencia MIT. Consulta [`LICENSE`](LICENSE) para más detalles.
