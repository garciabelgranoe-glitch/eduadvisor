# Sprint 19 - Technical Explanation

## Que se resolvio

- no existía persistencia de comparaciones por padre.
- el comparador no tenía puente entre descubrimiento y seguimiento.
- `parent-dashboard` no podía mostrar comparaciones reales guardadas.

## Enfoque aplicado

- se agregó modelo `SavedComparison` en Prisma con relación a `User`.
- se extendió módulo `parents` en NestJS con CRUD mínimo de comparaciones.
- se creó API web interna (`/api/parent/comparisons`) con sesión de padre.
- se incorporó `SaveComparisonButton` en `/compare/[ids]`.
- `parent-dashboard` muestra comparaciones guardadas y acceso directo al comparador canónico.

## Resultado

- familias guardan combinaciones de 2-3 colegios.
- comparaciones quedan disponibles entre sesiones.
- dashboard refleja métrica real de comparaciones activas.

## Riesgos y siguiente paso

- faltaba un sistema de alertas persistentes para cambios sobre shortlist.
- siguiente sprint recomendado: alertas de familia con lectura/estado y métricas reales.
