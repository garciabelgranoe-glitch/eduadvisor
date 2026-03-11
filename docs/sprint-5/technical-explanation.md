# Sprint 5 - Explicación técnica

## 1) Qué se implementó

- Conexión real frontend -> backend para listado, búsqueda y detalle de colegios.
- Comparador por URL (`?schools=slug1,slug2`).
- Metadata SEO dinámica por colegio + JSON-LD.
- `robots` y `sitemap` base para indexación.

## 2) Enfoque SEO first

- `/search` responde por query params legibles.
- `/school/[slug]` genera title/description dinámicos.
- `sitemap.xml` y `robots.txt` disponibles desde App Router.

## 3) Enfoque performance first

- Server-side data fetching con cache temporal (`revalidate`).
- Evitamos carga JS innecesaria en páginas de consulta.
- Estructura mobile-first preservada en layouts y cards.

## 4) Deuda explícita

- Faltan mapas interactivos reales y paginación visual en `/search`.
- Falta persistencia de selección para comparador multi-sesión.
- Falta conexión de `/review` al endpoint real con estados de envío.
