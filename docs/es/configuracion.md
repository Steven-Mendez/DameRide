# Configuración

## Expo

La configuración principal está en `app.json`.

| Clave | Valor observado |
| --- | --- |
| Nombre | `DameRide` |
| Slug | `DameRide` |
| Scheme | `dameride` |
| Orientación | `portrait` |
| New Architecture | `true` |
| Web output | `static` |

Plugins configurados:

- `expo-router` para navegación basada en archivos.
- `expo-location` para permisos de ubicación.
- `expo-image-picker` para galería y cámara.
- `expo-splash-screen` para splash screen.
- `@react-native-community/datetimepicker`.

## TypeScript

`tsconfig.json` extiende `expo/tsconfig.base`, activa `strict` y define alias:

```json
{
  "@/*": ["./*"]
}
```

## NativeWind y Tailwind

La app usa NativeWind con Tailwind CSS. Los archivos relevantes son `tailwind.config.js`, `babel.config.js`, `metro.config.js` y `global.css`. El tema define colores, tipografías Plus Jakarta Sans, radios y espaciados usados en componentes y pantallas.

## ESLint

`eslint.config.js` usa `eslint-config-expo/flat` e ignora `dist/*`.

## Supabase Local

La configuración local vive en `supabase/config.toml`. Incluye API local, DB, Realtime, Studio, Storage, Auth y Google OAuth mediante variables privadas.

