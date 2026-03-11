# Sprint 21 - Event Engine Architecture

## Objetivo

Implementar un motor de eventos de producto para disparar alertas automáticas a familias sobre su shortlist.

Eventos cubiertos:

- `REVIEW_APPROVED`
- `SCHOOL_PROFILE_UPDATED`
- `EDUADVISOR_SCORE_CHANGED`

## Diseño técnico

Nueva entidad persistente:

- `ProductEvent`
  - `type`
  - `schoolId`
  - `dedupeKey` (único)
  - `title`, `message`
  - `payload` JSON
  - `alertsCreated`
  - `createdAt`

Motor central:

- `ProductEventsService` (módulo global `product-events`)
- responsabilidades:
  - registrar evento (trazabilidad)
  - deduplicar por `dedupeKey`
  - fan-out a padres que guardaron el colegio (`SavedSchool`)
  - persistir alertas en `ParentAlert`

## Integraciones

### Reviews

- hook en `moderateReview`
- cuando una reseña cambia a `APPROVED`, emite `REVIEW_APPROVED`

### Schools

- hook en `updateSchoolProfile`
- detecta cambios significativos de campos (`name`, `description`, `website`, `phone`, `email`, `monthlyFeeEstimate`, `studentsCount`, `levels`)
- si hay cambios, emite `SCHOOL_PROFILE_UPDATED`

### Intelligence

- hook en `recomputeDailySnapshots`
- compara score previo vs nuevo por colegio
- emite `EDUADVISOR_SCORE_CHANGED` solo si `|delta| >= PARENT_ALERT_SCORE_DELTA_THRESHOLD` (default `4`)

## Escalabilidad y resiliencia

- dedupe persistente por `dedupeKey` evita alertas duplicadas
- dispatch no bloqueante de operaciones core: fallas de alertas no cancelan moderación/recompute/update
- índices en `ProductEvent(type, createdAt)` y `ProductEvent(schoolId, createdAt)`
- endpoint admin para auditoría operativa de eventos
