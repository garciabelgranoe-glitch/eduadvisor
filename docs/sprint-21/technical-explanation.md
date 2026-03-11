# Sprint 21 - Technical Explanation

## Qué se resolvió

- las alertas de familias no se alimentaban por eventos reales del producto.
- no había trazabilidad ni dedupe para notificaciones automáticas.
- faltaba auditoría operativa para revisar eventos emitidos.

## Enfoque aplicado

- se creó `ProductEvent` como registro persistente de eventos de dominio.
- se implementó `ProductEventsService` para centralizar:
  - generación del evento
  - deduplicación por `dedupeKey`
  - fan-out a `ParentAlert` de padres suscritos por `SavedSchool`
- se conectó el motor en tres flujos críticos:
  - aprobación de reseñas
  - edición de perfil de colegio
  - recalculo de score diario
- se agregó endpoint admin para observabilidad de eventos.

## Resultado

- alertas automáticas y consistentes para shortlist de familias.
- menor ruido por dedupe y threshold en score changes.
- base lista para evolucionar a colas/event bus sin romper contratos funcionales.

## Riesgos y siguiente paso

- dispatch actual es síncrono dentro del request lifecycle (con manejo de error no bloqueante).
- siguiente sprint recomendado: outbox + worker asíncrono + políticas de retry/replay.
