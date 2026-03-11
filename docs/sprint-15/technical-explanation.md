# Sprint 15 - Technical Explanation

## Por qué este sprint ahora

El producto ya tiene un alcance funcional amplio.  
El cuello de botella para avanzar a nivel premium pasa por reducir regresiones y mejorar predictibilidad de despliegue/local.

## Decisiones clave

- Priorizar tests en servicios con impacto directo en:
  - búsqueda,
  - captación comercial,
  - moderación/reputación,
  - consistencia de caché.
- Evitar fragilidad de frontend local:
  - `next start` siempre en `production`.
  - script `dev:clean` para limpiar `.next` ante estados corruptos.

## Resultado esperado

- Menor riesgo de romper flujos core al iterar.
- Mayor velocidad de refactor en backend.
- Menos incidentes de entorno local no reproducible.
