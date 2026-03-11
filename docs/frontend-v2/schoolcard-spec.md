# SchoolCard Spec v2

## Objetivo
Transformar la card en unidad de decisión, no solo listado.

## Variantes
- `search`: resultado estándar de búsqueda.
- `ranking`: ranking/city lists con énfasis competitivo.
- `saved`: shortlist/favoritos con tono cálido.
- `compact-mobile`: contexto reducido (compare related/suggestions).

## Estructura 3 capas
1. Resumen rápido: nombre, ubicación, score.
2. Prueba de calidad: TrustStrip + badges + métricas (DataEvidence).
3. Acción: CTA principal `Ver perfil y decidir` + secundarias (comparar/web/guardar).

## Señales de confianza
- Estado de perfil (BASIC/CURATED/VERIFIED/PREMIUM).
- Fuente de datos (Google + institucional / EduAdvisor + institucional).
- Fecha de actualización/verificación.
- Link a metodología.

## Eventos
- `school_profile_opened`
- `school_compare_clicked`
- `school_saved` (existente)

## Accesibilidad
- Focus visible en CTAs.
- Labels legibles en mobile.
- Jerarquía semántica (`h3`, métricas con contexto).
