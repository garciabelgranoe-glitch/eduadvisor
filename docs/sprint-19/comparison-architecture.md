# Sprint 19 - Comparison Architecture

## Objetivo

Agregar comparador persistente para familias:

- guardar combinaciones de 2 a 3 colegios
- reabrir comparaciones desde dashboard de padres
- mantener flujo autenticado por sesión real

## Diseño

Entidad nueva:

- `SavedComparison` con `userId`, `schoolSlugs[]`, timestamps

Flujo:

1. usuario entra a `/compare/[ids]`
2. guarda comparación con botón dedicado
3. backend valida slugs y estado activo de colegios
4. dashboard de padres muestra comparaciones guardadas

## API

- `GET /v1/parents/:userId/comparisons`
- `POST /v1/parents/:userId/comparisons`
- `DELETE /v1/parents/:userId/comparisons/:comparisonId`

## Frontend

- botón `SaveComparisonButton` en comparador canónico
- endpoint web interno `/api/parent/comparisons`
- bloque “Comparaciones guardadas” en `parent-dashboard`
