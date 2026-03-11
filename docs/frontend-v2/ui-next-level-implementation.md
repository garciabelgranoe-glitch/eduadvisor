# UI Next-Level Sprint - Implementación actual

Fecha: 2026-03-09

## Bloque A - Visual System v2
- Tokens v2 implementados en `app/globals.css`.
- Utilidades nuevas: `ea-surface-card`, `ea-transition-standard`, `ea-enter`, `ea-skeleton`.

## Bloque B - Trust-first UI
- Nuevo componente `TrustStrip` reutilizable.
- Integrado en:
  - `SearchResultCard`
  - perfil público de colegio.

## Bloque C - School cards premium
- `SearchResultCard` rediseñada con estructura 3 capas.
- Variantes: `search`, `ranking`, `saved`, `compact-mobile`.
- CTA principal orientada a decisión: `Ver perfil y decidir`.

## Bloque D - Filtros inteligentes
- Presets familiares.
- Chips activos removibles.
- Guardado/carga de preferencias en `localStorage`.
- Tracking de eventos (`search_preset_applied`, `search_preferences_saved`, `search_preferences_loaded`).

## Bloque E - Profile premium
- `TrustStrip` en zona alta del perfil.
- Métricas en `DataEvidence`.
- CTA sticky mobile para decisión rápida (`StickyDecisionCta`).

## Bloque F - Compare decision cockpit
- Ruta canónica consolidada en `/compare?schools=...`.
- `/compare/[ids]` ahora redirige a canónica.
- Insights automáticos de diferencias (cuota/score/rating).
- Tabla con resaltado de mejor valor por atributo.

## Bloque G - Matching explainability
- En `/matches`, bloque visual “Por qué aparece este colegio”.
- Breakdown con barras por criterio (distancia/presupuesto/nivel/calidad/intención).

## Bloque H - Motion & States premium
- Loading templates añadidos para:
  - search
  - compare
  - matches
  - profile de colegio

## Bloque I - UX Metrics integradas
- `ScrollDepthTracker` global (milestones 25/50/75/90 por ruta).
- `CompareInsightsTracker` para exposición del cockpit de decisión.
- Eventos adicionales:
  - `trust_methodology_opened`
  - `search_filter_chip_removed`
  - `search_preferences_saved`
  - `search_preferences_loaded`

## QA
- Lint: OK
- Build: OK
- Playwright smoke (core UX + conversion):
  - 5 passed
  - 1 skipped (depende de sitemap con perfiles geo)
  - 0 failed
