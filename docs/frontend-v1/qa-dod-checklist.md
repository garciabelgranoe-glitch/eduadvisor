# QA + Definition of Done - Frontend v1

## Aceptación funcional
- [ ] Home/Search/Profile/Compare renderizan sin errores.
- [ ] Todos los enlaces internos de perfil usan ruta canónica geo.
- [ ] Formularios de lead/review/claim comparten patrón DS (`FormShell`, `FormField`, `FormStatus`).
- [ ] Cada vista core tiene CTA primario claro y único en su bloque principal.

## Aceptación visual
- [ ] No hay estilos inline duplicados en pantallas core.
- [ ] Estados `loading/empty/error/success` son consistentes con `FeatureState`/`FormStatus`.
- [ ] Mobile: formularios y comparador utilizables sin overflow horizontal.
- [ ] Tipografía, espaciados y badges consistentes con DS v1.

## SEO y navegación
- [ ] Sin links internos a rutas legacy de perfil (`/school/[slug]`).
- [ ] Metadata de páginas core mantiene canonical correcto.
- [ ] Flujo de comparación y perfil no rompe indexación canónica.

## Accesibilidad
- [ ] Focus visible en botones, inputs y selects.
- [ ] Labels en todos los campos de formularios.
- [ ] Contraste legible en estados de feedback.

## Sanity analytics
- [ ] Eventos clave siguen disparando (search submit, compare click, profile open).
- [ ] No se rompieron hooks de tracking en tarjetas y CTA core.

## DoD técnico
- [ ] Lint de `@eduadvisor/web` en verde.
- [ ] Sin errores TS en rutas core.
- [ ] Cambios documentados en `docs/frontend-v1/*`.

## Estado de ejecución (2026-03-09)
- [x] Smoke QA core en Playwright (`tests/core-ux-smoke.spec.ts`) pasando: 4/4.
- [x] Rutas verificadas en smoke: `/`, `/search`, `/compare`, `/ingresar`.
- [x] `lint` de `@eduadvisor/web` ejecutado sin errores bloqueantes.
- [x] Corregido error de compilación en `app/api/schools/media/upload/route.ts`.
- [x] Batería QA frontend acotada pasando (`core-ux-smoke`, `gtm-functional-integral`, `product-auth`, `seo`, `gtm-private/public`): 12 passed, 9 skipped.
- [x] Tests de launch mode (`PRIVATE`/`PUBLIC`) condicionados al modo activo para evitar falsos negativos.
- [ ] QA automatizado de perfil geo (`/ar/[provincia]/[ciudad]/colegios/[slug]`) pendiente con fixture de datos estable.
- [ ] Suite integral legacy (`tests/*.spec.ts`) pendiente de normalizar a nuevo copy/launch mode y entorno.
