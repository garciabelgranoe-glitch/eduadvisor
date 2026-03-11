# Sprint 25 - Stability Architecture

## Objetivo

Cerrar brechas de estabilidad para dejar el producto en estado "market-ready local":

- errores de runtime sin fallback visual
- mismatch de hidratación por render no determinista
- pantallas sin estado de carga claro

## Decisiones técnicas

- se implementó una capa de recuperación en App Router:
  - `app/global-error.tsx` para fallos críticos
  - `app/error.tsx` para errores de segmento raíz
  - `app/admin/error.tsx` y `app/school-dashboard/error.tsx` para rutas de alta criticidad
- se agregaron `loading.tsx` en:
  - `app/loading.tsx`
  - `app/admin/loading.tsx`
  - `app/school-dashboard/loading.tsx`
- se eliminó render de fecha no determinista en componentes cliente sensibles usando `formatDateTimeUtc`.

## Resultado esperado

- sin “pantalla blanca” ante excepciones en admin/dashboard
- sin hydration mismatch por formatos regionales del navegador
- UX consistente durante espera de datos en rutas críticas
