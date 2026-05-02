# Build y Release

## Export

```bash
npm run export
```

Este comando ejecuta `expo export` y sirve como smoke test de exportación.

## Ejecución por Plataforma

```bash
npm run android
npm run ios
npm run web
```

## Checklist de Release

- Revisar que la licencia MIT siga siendo adecuada para la forma en que se distribuirá el proyecto.
- Confirmar redirect URLs finales para OAuth.
- Definir dominio/deep links productivos.
- Configurar cuentas de Google OAuth finales.
- Revisar políticas RLS y advisors de Supabase.
- Crear configuración de EAS Build si se publicará en tiendas.
- Revisar permisos de ubicación, cámara y galería en `app.json`.
