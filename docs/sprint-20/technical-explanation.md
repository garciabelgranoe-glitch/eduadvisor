# Sprint 20 - Technical Explanation

## Que se resolvio

- métrica `unreadAlerts` estaba en cero fijo.
- dashboard de padres no tenía alertas persistentes.
- no había operación de lectura/ack para alertas.

## Enfoque aplicado

- se creó modelo `ParentAlert` con relación a `User` y `School`.
- se agregaron endpoints backend para listar y marcar alertas.
- `parents.service` ahora genera alertas al guardar colegio/comparación.
- se incorporó `ParentAlertsPanel` con React Query y acción `Marcar leída`.
- dashboard consume alertas reales y refleja contador real de no leídas.

## Resultado

- experiencia de familias más accionable y persistente.
- estado de alertas consistente entre sesiones.
- base preparada para futuras alertas de cambios de rating/precio/eventos.

## Riesgos y siguiente paso

- falta generar alertas automáticas por eventos de dominio (reviews nuevas, cambios de cuota, open house).
- siguiente sprint recomendado: motor de eventos y reglas de notificación para crecimiento y retención.
