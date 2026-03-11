# Screen Blueprints - Core

## Home (`/`)
- Hero con buscador guiado (`HeroSearch`).
- Carrusel de colegios premium.
- 3 bloques de valor con CTA claro.
- Sección "Últimos colegios" con `SearchResultCard`.
- Sección rankings + links de landings geo.

### CTA principal
- `Buscar colegios`.

## Search (`/search`)
- Columna izquierda: `SearchFiltersForm` + mapa.
- Columna derecha: `SectionHeader` resultados + listado.
- Estado sin resultados con `FeatureState`.

### CTA principal
- `Ver perfil completo` dentro de cada resultado.

## Profile (`/ar/[province]/[city]/colegios/[schoolSlug]`)
- Hero perfil: nombre, descripción, badges, score, CTA del perfil.
- Bloque de información institucional.
- Bloque de reseñas recientes (con estado vacío).
- Mapa de ubicación.
- Módulo de media premium.
- Formulario de lead con lock según plan.

### CTA principal
- `Agregar a comparador`.

## Compare (`/compare`, `/compare/[ids]`)
- Header de comparador.
- Estado vacío con guía y salida a búsqueda.
- Selección progresiva de 2-3 colegios.
- Tabla comparativa lado a lado (`CompareTable`).

### CTA principal
- `Comparar ahora` (cuando hay 2 o más colegios).

## Jerarquía de navegación
- Top nav orientado a discovery.
- Accesos de panel por rol fuera de navegación pública principal.
- Enlaces internos a perfiles siempre canónicos geo.
