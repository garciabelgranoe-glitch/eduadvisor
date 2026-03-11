# Sprint 27 - QA SEO y Contenido de Landings (GTM-026)

## Objetivo

Cerrar `GTM-026` con validación automatizada de SEO técnico y contenido para landings geográficas de ciudades.

## Alcance funcional

- cobertura de `sitemap_geo.xml` (urlset o sitemap index por chunks)
- validación de rutas indexables de ciudad (`/ar/[provincia]/[ciudad]/...`)
- verificación de metadata SEO en listados (`robots`, `canonical`)
- validación de esquema estructurado (`BreadcrumbList`, `ItemList`, `FAQPage`)
- verificación de redirect legacy (`/colegios-en-[ciudad]` -> ruta geo canónica)
- guardrail de paginación profunda (`?page=2` noindex)

## Estrategia de QA

- tests Playwright orientados a request-level para estabilidad y velocidad.
- selección dinámica de URLs desde sitemap en lugar de hardcodear ciudades.
- soporte explícito de estado de maduración SEO: si no hay landings indexables por guardrails de calidad, el suite valida ese estado sin falso negativo.

## Criterios de aceptación

1. Sitemap geo responde y expone cobertura coherente.
2. Si existen landings indexables, metadata y contenido cumplen contrato SEO.
3. Legacy routes redirigen a arquitectura geo canónica.
4. Paginación profunda no genera páginas indexables duplicadas.
