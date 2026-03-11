# Sprint 20 - Parent Alerts Architecture

## Objetivo

Agregar un sistema de alertas persistentes para familias:

- alertas reales en `parent-dashboard`
- contador de no leídas basado en datos
- capacidad de marcar alerta como leída

## Diseño backend

Nueva entidad:

- `ParentAlert` con `userId`, `schoolId?`, `type`, `title`, `message`, `linkPath`, `payload`, `isRead`, `readAt`

Tipos iniciales:

- `SAVED_SCHOOL_ADDED`
- `COMPARISON_SAVED`
- `SCHOOL_UPDATE`

Flujos:

1. al guardar colegio se crea alerta de shortlist.
2. al guardar comparación se crea alerta con link canónico.
3. dashboard calcula `unreadAlerts` desde `ParentAlert.isRead = false`.

## Diseño frontend

- nuevo endpoint interno `/api/parent/alerts`
- componente cliente `ParentAlertsPanel` en dashboard:
  - listado de alertas
  - CTA para abrir detalle
  - acción para marcar leída

## Escalabilidad

- índice compuesto `@@index([userId, isRead, createdAt])`
- consultas limitadas por usuario (`take`)
- payload JSON opcional para evolución de eventos sin romper contrato
