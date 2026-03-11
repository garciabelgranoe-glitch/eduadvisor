# Motion & States Spec v2

## Objetivo
Dar sensación premium con feedback inmediato y consistente.

## Motion rules
- Entrada de módulos: `.ea-enter`
- Transición estándar: `.ea-transition-standard`
- Duraciones:
  - fast: 160ms
  - base: 240ms
  - slow: 360ms
- Easing:
  - standard: `cubic-bezier(0.2,0.8,0.2,1)`
  - emphasis: `cubic-bezier(0.16,1,0.3,1)`

## Estados UX
- Loading: skeleton shimmer (`.ea-skeleton`) por template.
- Empty: mensaje útil + CTA explícita.
- Error: mensaje accionable + retry path.
- Success: confirmación corta + siguiente acción.

## Cobertura implementada
- Loading templates: search, compare, matches, school profile.
- Empty/error premium en flujos core.

## QA
- Sin flashes bruscos de layout.
- Skeletons con geometría parecida al contenido final.
- CTA usable en mobile durante carga parcial.
