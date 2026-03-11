# Sprint 2 - Estructura de carpetas UX/UI

```text
apps/web/
  app/
    page.tsx
    search/page.tsx
    school/[slug]/page.tsx
    compare/page.tsx
    review/page.tsx
    parent-dashboard/page.tsx
    school-dashboard/page.tsx
    rankings/page.tsx
    matches/page.tsx
    market-insights/page.tsx
  components/
    ui/
      badge.tsx
      button.tsx
      card.tsx
      input.tsx
      metric-tile.tsx
    sections/
      compare-table.tsx
      hero-search.tsx
      ranking-list.tsx
      review-form.tsx
    school/
      school-card.tsx
    dashboard/
      dashboard-shell.tsx
      recent-activity.tsx
    layout/
      site-header.tsx
  lib/
    mock-data.ts
    query-client.ts
    utils.ts
```

## Criterio estructural

- `ui/`: primitivas visuales agnosticas.
- `sections/`: bloques de pagina reutilizables.
- `school/` y `dashboard/`: componentes de dominio.
- `lib/mock-data.ts`: fixtures para diseño y validacion temprana de layout.
