# Component Contract Catalog - DS v1

## UI Primitives

### `Button`
- Props clave: `variant`, `size`, `disabled`, `type`.
- Uso: acción primaria/secundaria del bloque.
- Regla: evitar múltiples botones `default` en el mismo bloque.

### `Card`
- Props clave: `tone`, `className`.
- Uso: contención visual de módulos.

### `Input` / `Select` / `Textarea`
- Contrato: controlado/no controlado compatible con formularios React.
- Regla: usar siempre dentro de `FormField` cuando hay label.

### `SectionHeader`
- Props: `kicker?`, `title`, `description?`, `actions?`.
- Uso: encabezado consistente de secciones y pantallas.

### `FeatureState`
- Props: `title`, `description`, `tone?`, `actionLabel?`, `actionHref?`, `actionSlot?`.
- Uso: estados `empty/error/success/warning`.

### `FormShell`
- Props: `title`, `description?`.
- Uso: contenedor principal de formularios.

### `FormField`
- Props: `label`, `hint?`.
- Uso: wrapper estándar de control + label.

### `FormStatus`
- Props: `errorMessage?`, `successMessage?`.
- Uso: feedback de envío/validación.

### `CtaGroup`
- Props: `primary`, `secondary?`, `helperText?`.
- Uso: composición consistente de acciones.

## Feature Components (core)

### `SearchResultCard`
- Entrada: `ApiSchoolListItem`, `compareHref?`, `compareButtonLabel?`, `showSaveButton?`.
- Salida UX: tarjeta homogénea de resultados con 1 CTA primario.
- Ruta perfil: obligatoria canónica geo.

### `SearchFiltersForm`
- Entrada: `current` (`SchoolSearchParams`).
- Salida UX: filtros de búsqueda estandarizados.

### `LeadCaptureForm`
- Entrada: `school`, `locked?`.
- Estado: `loading/error/success` visible.
- Regla: mismo patrón visual que review/claim.

### `ReviewForm`
- Entrada: `prefillSchoolSlug?`.
- Estado: `loading/error/success` visible.

### `SchoolPublishForm`
- Entrada: opcional por query para claim/publish.
- Estado: `loading/error/success` visible.

## Rutas canónicas
- Perfil: `/ar/[provincia]/[ciudad]/colegios/[slug]`
- Listado ciudad: `/ar/[provincia]/[ciudad]/colegios`
- Categoría ciudad: `/ar/[provincia]/[ciudad]/colegios/[categoria]`
- Comparador: `/compare` y `/compare/[ids]`
