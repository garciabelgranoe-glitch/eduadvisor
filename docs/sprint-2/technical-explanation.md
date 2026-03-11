# Sprint 2 - Explicacion tecnica

## 1) Por que este enfoque

Se priorizo un sistema de componentes reutilizable en lugar de pantallas acopladas para minimizar deuda visual y facilitar iteracion de producto.

## 2) Decisiones relevantes

- `layout.tsx` centraliza tipografia, atmosfera visual y footer de marca.
- `globals.css` define tokens base, animaciones y patron de fondo.
- Cada pantalla se construye con composicion de secciones reutilizables.
- Dashboards comparten shell comun para reducir inconsistencias.

## 3) Resultado del sprint

- 7 pantallas requeridas entregadas con UI funcional de alto nivel.
- Navegacion completa entre pantallas core.
- Base visual premium lista para integrar datos reales en Sprint 3/5.

## 4) Limites intencionales de Sprint 2

- Datos mock (sin consumo real de API todavia).
- Sin logica de autenticacion activa.
- Sin estados de error/loading conectados a backend.

Estos puntos quedan resueltos en sprintes backend/frontend core.
