# Sprint 27 - Technical Explanation

## Problema abordado

Faltaba evidencia automatizada de calidad SEO en el bloque Go-To-Market para landings por ciudad.

## Implementación

- Nuevo suite E2E: `apps/web/tests/gtm-seo-city-content.spec.ts`.
- Cobertura sobre:
  - estructura de sitemap geo (incluyendo chunking)
  - metadata `robots/canonical` en landings `/colegios`
  - presencia de contenido editorial clave (Top picks, FAQ)
  - JSON-LD crítico (breadcrumb/lista/faq)
  - redirect legacy a rutas canónicas
  - regla noindex en paginación profunda
- Diseño resilient a dataset incompleto: cuando no hay ciudades indexables aún, valida modo guardrail en lugar de romper el pipeline.

## Resultado

- Suite SEO ejecuta en verde en entorno actual.
- Se mantiene trazabilidad de calidad SEO sin bloquear releases por falta temporal de cobertura de datos indexables.
