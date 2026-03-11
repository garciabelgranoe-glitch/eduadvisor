# Design System Spec v1 - EduAdvisor

## Objetivo
Definir lenguaje visual y componentes base para consistencia de producto, velocidad de desarrollo y escalabilidad.

## Tokens
### Color (semánticos)
- `--ea-bg`: fondo app.
- `--ea-surface`: superficie principal.
- `--ea-border`: bordes estándar.
- `--ea-text`: texto principal.
- `--ea-muted`: texto secundario.
- `--ea-primary`: marca/acción principal.
- `--ea-primary-foreground`: texto sobre primario.
- `--ea-success`, `--ea-warning`, `--ea-danger`: estados.

### Forma y elevación
- Radios: `--ea-radius-sm`, `--ea-radius-md`, `--ea-radius-lg`, `--ea-radius-xl`.
- Sombras: `--ea-shadow-sm`, `--ea-shadow-md`, `--ea-shadow-lg`.
- Focus ring: `--ea-focus-ring`.

### Tipografía
- Títulos: `font-display`.
- Cuerpo: sans base del proyecto.
- Escala recomendada:
  - Hero: `text-4xl` a `text-5xl`
  - Section title: `text-3xl`
  - Body: `text-sm` / `text-base`
  - Meta/kicker: `text-xs` uppercase tracking

## Primitivas v1
- `Button`: variantes `default | secondary | ghost`, tamaños `sm | md | lg`.
- `Card`: variante base + tonos (`default`, `soft`, `warning`, `danger`).
- `Input`, `Select`, `Textarea`: foco y borde consistentes.
- `SectionHeader`: encabezado estándar de sección.
- `FeatureState`: estado `empty/error/success/warning` con CTA opcional.
- `FormShell`: contenedor de formulario.
- `FormField`: label/hint/campo.
- `FormStatus`: feedback `error/success`.
- `CtaGroup`: agrupación de CTA con jerarquía.

## Patrones
### CTA
- 1 CTA primario por bloque principal.
- CTA secundarios en `secondary`/`ghost`.
- Microcopy accionable y no técnico.

### Formularios
- Orden: título -> descripción -> campos -> estado -> CTA.
- Validación mínima cliente + feedback visible.
- Estados de envío explícitos (`Enviando...`, `Guardando...`).

### Estados UX
- `loading`: copiar breve.
- `empty`: explicar qué pasó y cómo continuar.
- `error`: legible y recuperable.
- `success`: confirmación inmediata.

## Accesibilidad v1
- Focus visible en todos los controles.
- Contraste suficiente en estados y textos.
- Labels explícitos en formularios.

## Implementación
- Archivos base en `apps/web/components/ui/*`.
- Tokens en `apps/web/app/globals.css`.
