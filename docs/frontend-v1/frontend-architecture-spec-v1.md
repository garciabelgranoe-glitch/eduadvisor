# Frontend Architecture Spec v1 - EduAdvisor

## Objetivo
Implementar una base frontend premium, consistente y escalable en `apps/web`, manteniendo contratos API y lógica de negocio existente.

## Principios
- Consistencia visual y de interacción mediante Design System v1.
- Arquitectura por capas: `app` (rutas) -> `features/sections/components` -> `ui` (primitivas).
- SEO first: rutas canónicas geo y metadata consistente.
- Performance first: componentes ligeros, estados UX explícitos, hydration estable.
- Product first: CTA claro por pantalla y microcopy en español orientado a familias.

## Alcance Fase 1
1. Crear Design System v1 (tokens + primitivas).
2. Refactor Home/Search/Profile/Compare para usar DS v1.
3. Unificar navegación y jerarquía de CTA.
4. Normalizar enlaces internos a rutas canónicas geo.
5. Estandarizar estados UX (`loading`, `empty`, `error`, `success`).
6. Estandarizar microcopy y labels en español.

## No alcance
1. Sin cambios de backend ni contratos API.
2. Sin nuevas features de negocio.
3. Sin cambios de auth/billing, excepto presentación UX.

## Arquitectura por capas
- `app/*`: composición de pantallas, metadata y wiring de datos.
- `components/sections/*`: bloques de pantalla reutilizables por feature.
- `components/ui/*`: primitivas de DS (Button, Card, Input, Select, Form, FeatureState, SectionHeader).
- `lib/*`: clientes API, utilidades SEO, analytics, formato.

## Reglas de implementación
- Usar primitivas DS v1 para nuevos bloques de UI.
- Evitar estilos inline ad-hoc.
- Un único CTA primario visible por viewport/superficie principal.
- Formularios clave (lead/review/claim) con patrón único de campos/estado/error/success.
- Enlaces de perfil siempre canónicos: `/ar/[provincia]/[ciudad]/colegios/[slug]`.

## Estados UX por feature
- `loading`: skeleton o texto de carga corto y claro.
- `empty`: `FeatureState` con guidance accionable.
- `error`: mensaje claro + acción de recuperación.
- `success`: feedback visible en formulario o acción.

## Riesgos y mitigaciones
- Riesgo: regresión visual por mezcla de estilos legacy.
  - Mitigación: migración por pantalla + checklist QA visual.
- Riesgo: links legacy internos.
  - Mitigación: barrido con `rg` y validación manual de rutas core.
- Riesgo: hydration mismatch.
  - Mitigación: evitar rendering no determinístico en SSR.

## Entregables
- `docs/frontend-v1/design-system-spec-v1.md`
- `docs/frontend-v1/component-contract-catalog.md`
- `docs/frontend-v1/screen-blueprints.md`
- `docs/frontend-v1/qa-dod-checklist.md`
