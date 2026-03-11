# Filter UX Spec v2

## Objetivo
Pasar de filtros estáticos a un compositor inteligente orientado a objetivos familiares.

## Componentes
- `FilterBar` (form principal)
- `ActiveChips` (chips removibles)
- `PresetChips` (escenarios sugeridos)
- `SavedPreferences` (guardar/cargar preferencias)

## Presets iniciales
- Bilingüe + jornada completa
- Secundaria con alta respuesta
- Inicial cuota accesible

## Reglas UX
- Los filtros activos siempre visibles.
- Cada chip se puede limpiar individualmente.
- Estado guardado local por browser (`localStorage`).
- Eventos de analytics en apply/save/load/preset.

## Métricas
- % uso de presets
- % búsquedas con 3+ filtros
- click-to-result depth
- conversión search->profile y search->lead
