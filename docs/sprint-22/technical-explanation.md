# Sprint 22 - Technical Explanation

## Qué se resolvió

- faltaba un embudo de conversión de padres medible con datos del producto.
- admin analytics no tenía vista de drop-offs por etapa de decisión.
- dashboard de padres no guiaba el próximo paso para completar funnel.

## Enfoque aplicado

- se agregó `GrowthFunnelSnapshot` para historizar conversiones por ventana.
- se implementó cálculo de funnel en `AdminService` sobre datos reales:
  - usuarios padre
  - guardados
  - comparaciones
  - leads
  - leads cerrados
- se publicaron endpoints admin para lectura y recompute de snapshots.
- se integró la lectura de funnel en `/admin/analytics`.
- se agregó `nextAction` en dashboard de padres para activar el siguiente paso del funnel.

## Resultado

- el equipo puede detectar exactamente dónde se pierde conversión.
- la capa admin ahora entrega recomendaciones accionables, no solo métricas sueltas.
- familias reciben guidance contextual para avanzar en el proceso de decisión.

## Riesgos y siguiente paso

- el funnel actual se centra en acciones con sesión de padre; no incluye tráfico anónimo.
- siguiente sprint recomendado: monetización y experimentación (A/B) sobre CTAs de conversión.
