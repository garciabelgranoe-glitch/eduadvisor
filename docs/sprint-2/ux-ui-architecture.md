# Sprint 2 - UX/UI Architecture

## 1) Arquitectura tecnica de UX/UI

### Objetivo

Diseñar una experiencia premium, confiable y educativa, alineada a decisiones de alto impacto para familias y colegios.

### Principios aplicados

- Claridad de decision: cada pantalla reduce incertidumbre.
- Evidencia visible: ratings, score y datos institucionales con protagonismo.
- Escalabilidad visual: sistema reusable para crecer multi-pais.
- Mobile first: layout responsive y acciones prioritarias arriba del fold.

### Sistema de interfaz

Base reusable en `apps/web/components/ui`:

- `Button`
- `Card`
- `Badge`
- `Input`
- `MetricTile`

Componentes de dominio en `components/sections`, `components/school`, `components/dashboard`.

### Identidad visual

- Tipografia:
  - Sans: Plus Jakarta Sans
  - Display: Lora
- Direccion cromatica:
  - Verde profundo (confianza + datos)
  - Ambar suave (calidez + decision familiar)
  - Fondo atmosferico con gradientes y patron de grilla
- Motion:
  - `animate-rise` para entrada de tarjetas y bloques clave

### IA de navegacion (pantallas Sprint 2)

- Home: mensaje principal + busqueda + destacados + ranking inicial.
- Search results: filtros + resultados + contenedor de mapa.
- School profile: propuesta de valor, metricas, reviews y CTA de comparacion.
- Compare schools: tabla lado a lado orientada a decision.
- Review form: formulario estructurado con guias de calidad.
- Parent dashboard: estado de decision (favoritos, alertas, actividad).
- School dashboard: leads, conversion y actividad operativa.

## 2) Preparacion para crecimiento

- Estructura lista para internacionalizacion por pais/ciudad.
- Layout y metadatos SEO integrados por ruta.
- Componentes listos para integrar Shadcn UI en iteraciones siguientes sin refactor masivo.
