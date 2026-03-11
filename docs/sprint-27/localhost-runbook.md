# Sprint 27 - Localhost Runbook (GTM-026)

## Ejecutar QA SEO

1. Desde raíz:
   - `corepack pnpm --filter @eduadvisor/web test -- tests/seo.spec.ts tests/gtm-seo-city-content.spec.ts`
2. Lint recomendado:
   - `corepack pnpm --filter @eduadvisor/web lint`

## Interpretación de resultados

- `passed`: controles SEO validados.
- `skipped` en tests de ciudad: estado válido cuando no hay aún landings indexables por guardrails de calidad (dataset en maduración).

## Cómo habilitar cobertura completa de landings

1. Importar/curar más colegios por ciudad hasta superar umbral de indexación.
2. Verificar que `sitemap_geo.xml` ya incluya rutas `/ar/[provincia]/[ciudad]/colegios`.
3. Re-ejecutar suite y confirmar que desaparecen los `skipped`.
