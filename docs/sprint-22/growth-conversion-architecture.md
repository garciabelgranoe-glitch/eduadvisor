# Sprint 22 - Growth Conversion Architecture

## Objetivo

Convertir el seguimiento de crecimiento en una capacidad de producto real:

- embudo de conversión persistente para familias
- métricas accionables para admin
- next best action para activar cuentas de padres

## Diseño backend

Nueva entidad:

- `GrowthFunnelSnapshot`
  - snapshot diario por `windowDays`
  - etapas de conversión:
    - `parentsTotal`
    - `parentsWithSavedSchools`
    - `parentsWithComparisons`
    - `parentsWithLeads`
    - `parentsWithClosedLeads`
  - tasas:
    - `conversionToSaved`
    - `conversionToCompared`
    - `conversionToLead`
    - `conversionToClosedLead`

Servicios:

- `AdminService.getGrowthFunnel`
  - calcula embudo actual (ventana móvil)
  - devuelve tendencia desde snapshots
  - calcula drop-off y recomendaciones
- `AdminService.recomputeGrowthFunnel`
  - persiste snapshot diario

## Diseño frontend

- `admin/analytics` consume embudo real por API backend
- agrega bloques de:
  - etapas
  - conversiones por etapa
  - drop-offs
  - recomendaciones operativas

## Growth loop en producto padre

- `ParentsService.getDashboard` ahora devuelve `nextAction`
- `parent-dashboard` muestra “Siguiente paso” con CTA contextual
- reglas por etapa:
  - sin guardados -> descubrir
  - sin comparaciones -> comparar
  - sin leads -> contactar
  - sin cerrados -> seguimiento
  - con cerrados -> reactivar ciclo

## Escalabilidad

- snapshots evitan recomputar históricos costosos
- índices por `windowDays,date`
- lectura admin separada de flujo transaccional de usuario
