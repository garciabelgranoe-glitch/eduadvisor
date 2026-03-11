# Compare UX Spec v2

## Objetivo
Convertir compare en un cockpit de decisión, no una tabla pasiva.

## Rutas
- Canónica: `/compare?schools=slug1,slug2,slug3`
- Compatibilidad: `/compare/[ids]` redirige a ruta canónica.

## Flujo
1. Selección de colegios (hasta 3)
2. Detección automática de diferencias clave
3. Tabla comparativa con resaltado de mejor valor por atributo
4. Guardado de comparación

## Cockpit modules
- `Diferencias clave detectadas` (insights automáticos)
- `CompareTable` con highlights por celda
- Estado de selección + remover rápido

## Heurísticas automáticas
- Mejor valor: score/rating/google/profilestatus (max)
- Mejor costo: cuota/matrícula (min)
- Mensajes de diferencia: cuota, score, rating

## Eventos
- add/remove school compare set
- comparison saved
- compare table viewed
