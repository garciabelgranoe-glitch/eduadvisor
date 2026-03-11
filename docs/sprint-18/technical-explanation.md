# Sprint 18 - Technical Explanation

## Que se resolvio

- dashboard de padres dependía de datos mock y no de sesión real.
- no existía persistencia de favoritos padre-colegio.
- CTAs de producto no permitían construir shortlist reutilizable.

## Enfoque aplicado

- se agregó modelo `SavedSchool` y relaciones en Prisma (`User`/`School`).
- se implementó módulo `parents` en NestJS para dashboard y favoritos.
- se creó API web interna (`/api/parent/saved-schools`) basada en cookie firmada.
- se incorporó botón reutilizable `SaveSchoolButton` en resultados y perfil.
- `parent-dashboard` ahora consume backend real y muestra favoritos reales.

## Resultado

- familias pueden guardar y quitar colegios con estado persistente.
- dashboard de padres muestra shortlist real y métricas consistentes.
- base preparada para próximos features de comparación y alertas personalizadas.

## Riesgos y siguiente paso

- falta historizar eventos de favoritos para recomendaciones y growth loops.
- siguiente sprint recomendado: comparador persistente por usuario + alertas por cambios en colegios guardados.
