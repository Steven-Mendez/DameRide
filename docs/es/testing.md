# Testing

## Validación Estática

El repositorio incluye scripts de validación estática para linting y TypeScript.

| Script | Qué valida |
| --- | --- |
| `npm run lint` | ESLint con configuración Expo. |
| `npm run typecheck` | TypeScript sin emitir archivos. |
| `npm run validate` | Ejecuta lint y typecheck. |

## Comando Principal

```bash
npm run validate
```

## Export Smoke Test

```bash
npm run export
```

## Cobertura Sugerida

- Pruebas unitarias para utilidades como formato, mapas y helpers.
- Pruebas de integración para `src/lib/database.ts`.
- Pruebas de flujos críticos: login, onboarding, publicar, reservar y cancelar.
- Pruebas end-to-end en dispositivo/emulador.
