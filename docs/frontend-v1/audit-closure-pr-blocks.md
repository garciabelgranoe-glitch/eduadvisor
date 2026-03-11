# Frontend Audit Closure - PR por bloques

Fecha: 2026-03-09  
Scope: `apps/web`

## Bloque 1 - Eliminación patrón `Link > Button`

### Objetivo
Eliminar composición inválida/anti-semántica `Link > Button` y estandarizar CTA navegables en `Button asChild`.

### Implementación
- Se extendió `Button` con `asChild` y forwarding correcto de props.
- Se migraron CTA navegables relevantes en páginas core y componentes (`home`, `compare`, `ingresar`, `error`, `not-found`, `para-colegios`, `hero`, `profile`, `feature-state`, etc.).

### Evidencia técnica
- Verificación por patrón:
  - `rg -n "<Link[^>]*>\\s*<Button" apps/web -U`
  - Resultado: sin matches.

### Resultado
- Patrón eliminado en frontend.
- Accesibilidad/semántica de navegación consistente con `link` estilizado como botón.

---

## Bloque 2 - Normalización de copy ES (nav / metadata / dashboard / admin / error)

### Objetivo
Uniformar lenguaje en español para navegación, metadatos y vistas operativas.

### Cambios destacados
- Navegación:
  - `Top matches` -> `Recomendaciones`
  - `Insights` -> `Inteligencia de mercado`
- Metadata:
  - `Admin panel` -> `Panel administrador`
  - `Market insights` -> `Inteligencia de mercado`
  - `Top matches` -> `Recomendaciones IA`
  - `Escribir review` -> `Escribir reseña`
- Admin/Error:
  - `Admin console` -> `Panel administrador`
  - `Launch Gate` -> `Control de lanzamiento`
  - `SEO Health Dashboard` -> `Panel de salud SEO`
- Dashboard:
  - `Reviews` -> `Reseñas`
  - `Snapshot institucional` -> `Resumen institucional`
  - `Upgrade premium` -> `Mejora a Premium`

### Resultado
- Copy consistente en español en zonas de navegación, metadatos y operación interna.

---

## Bloque 3 - Migración de formularios remanentes a primitives UI

### Objetivo
Estandarizar formularios restantes con primitives:
`Input`, `Select`, `Textarea`, `FormField`, `FormShell`, `FormStatus`.

### Archivos migrados (principales)
- `apps/web/app/admin/claims/page.tsx`
- `apps/web/app/admin/schools/page.tsx`
- `apps/web/app/market-insights/page.tsx`
- `apps/web/app/matches/page.tsx`
- `apps/web/app/school-dashboard/page.tsx` (selector de colegio activo)
- `apps/web/components/admin/claim-requests-queue.tsx`
- `apps/web/components/admin/admin-billing-tools.tsx`
- `apps/web/components/dashboard/school-profile-editor.tsx`
- `apps/web/components/dashboard/school-review-response-board.tsx`

### Nota
- En `school-profile-editor` se mantienen `input type=file` nativos por requerimientos de carga de archivos; el resto de campos quedó normalizado con primitives.

### Resultado
- Patrón visual/funcional consistente en formularios.
- Menor duplicación de estilos y mejor mantenibilidad.

---

## Bloque 4 - Propuesta de simplificación de rutas `compare` y separación de responsabilidades en `colegios/[schoolSlug]`

### Estado actual
- `compare` usa dos entradas (`/compare` y `/compare/[ids]`) con lógica solapada.
- `ar/[province]/[city]/colegios/[schoolSlug]/page.tsx` mezcla dos responsabilidades:
  - perfil de colegio
  - categoría SEO (bilingües, deportes, etc.)

### Propuesta

#### 4.1 Compare
- Definir una sola ruta canónica de estado: `/compare?schools=slug1,slug2,slug3`.
- Mantener `/compare/[ids]` solo como compatibilidad temporal:
  - redirección 301 a canónica (`/compare?schools=...`).
- Unificar parsing/validación de slugs en helper único (`lib/compare/selection.ts`).

#### 4.2 Perfil/colegios
- Separar categorías SEO de perfil de colegio.
- Nuevo esquema propuesto:
  - Perfil colegio: `/ar/[province]/[city]/colegios/[schoolSlug]`
  - Categorías: `/ar/[province]/[city]/colegios/categoria/[category]`
- Extraer lógica a módulos de dominio:
  - `lib/seo/school-profile/*`
  - `lib/seo/school-category/*`
- Beneficio: evita colisiones semánticas (`schoolSlug` vs `category`), reduce complejidad del page file y mejora mantenibilidad SEO.

### Plan de ejecución sugerido
1. Crear helpers compartidos (parse/normalización/redirección).
2. Implementar ruta `categoria/[category]`.
3. Simplificar `colegios/[schoolSlug]` para que solo resuelva perfiles.
4. Mantener redirects y tests de compatibilidad 30 días.

---

## Checklist de aceptación

- [x] Todas las pantallas core usan componentes del DS v1 (sin estilos inline duplicados en formularios/CTA core).
- [x] Se eliminó el patrón `Link > Button` en frontend.
- [x] Formularios de lead/review/claim comparten primitives y se migraron remanentes principales de admin/dashboard/search/matches.
- [x] Copy ES normalizado en nav/metadata/dashboard/admin/error.
- [x] Mobile: navegación y formularios core sin fricción (validado por smoke responsive).
- [x] QA visual/funcional en rutas core sin regresiones críticas detectadas.

---

## Evidencia QA

### Lint
Comando:
- `corepack pnpm --filter @eduadvisor/web lint`

Resultado:
- `✔ No ESLint warnings or errors`

### Responsive + UX smoke (Playwright)
Comando:
- `corepack pnpm exec playwright test tests/core-ux-smoke.spec.ts tests/product-conversion.spec.ts`

Resultado:
- `5 passed`
- `1 skipped` (caso dependiente de disponibilidad de perfiles geo en sitemap)
- `0 failed`

Casos cubiertos:
- Home desktop/mobile (CTA y render sin runtime error)
- Search (filtros + mapa base + estado UX)
- Compare vacío (mensaje + CTA salida)
- Ingreso (flujos familias/colegios)
- Conversión mobile header (acciones primarias)
