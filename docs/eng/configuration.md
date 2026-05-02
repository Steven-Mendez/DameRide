# Configuration

## Expo

The main configuration lives in `app.json`.

| Key | Observed value |
| --- | --- |
| Name | `DameRide` |
| Slug | `DameRide` |
| Scheme | `dameride` |
| Orientation | `portrait` |
| New Architecture | `true` |
| Web output | `static` |

Configured plugins:

- `expo-router` for file-based navigation.
- `expo-location` for location permissions.
- `expo-image-picker` for gallery and camera access.
- `expo-splash-screen` for splash screen handling.
- `@react-native-community/datetimepicker`.

## TypeScript

`tsconfig.json` extends `expo/tsconfig.base`, enables `strict`, and defines this alias:

```json
{
  "@/*": ["./*"]
}
```

## NativeWind and Tailwind

The app uses NativeWind with Tailwind CSS. Relevant files are `tailwind.config.js`, `babel.config.js`, `metro.config.js`, and `global.css`. The theme defines colors, Plus Jakarta Sans font families, radii, and spacing used across components and screens.

## ESLint

`eslint.config.js` uses `eslint-config-expo/flat` and ignores `dist/*`.

## Local Supabase

Local configuration lives in `supabase/config.toml`. It includes local API, DB, Realtime, Studio, Storage, Auth, and Google OAuth through private variables.

