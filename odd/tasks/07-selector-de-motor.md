# ODD — SPEC 07 Selector de motor y publicación

Objetivo, alcance y criterios: `specs/07-selector-de-motor.md` (fuente de verdad, no se copia aquí).
Rama: `spec-07-selector-de-motor` (encadenada sobre `spec-06-vanilla-spa-core`). Entrega: una PR. Verificación: `pnpm dev`, `pnpm refresh`, `pnpm build`, `pnpm preview`, revisión de `app/framework/` y `dist/app/framework/` con cada motor.

## Specs

- S1 — `spa.config.js` y `.example` con `engine: 'jquery' | 'vanilla'` y `framework.vanillaSpaCore*`.
- S2 — `src/engines/jquery/` y `src/engines/vanilla/` con `main.js` y `spa.js`; sin `src/main.js` ni `src/spa/`.
- S3 — `spa-build` con tipos/paths `engine`, `copyEngine`, `copyFrameworkVanillaSpaCore` y copia condicional.
- S4 — `spa-server` con `engine-shell.js`; `dev-server` lee `spa.config.js` y filtra el shell.
- S5 — `index.html` con bloques de motor, import maps y entry; `minifyRootIndex` filtra.
- S6 — `jsconfig`, `AGENTS.md`, `README.md` y `specs/arquitectura/01...` actualizados.
- S7 — Verificación con ambos motores y sin mezcla en `app/`/`dist/`.

## Tasks

- [ ] T1 — S1 — inline — pendiente
- [ ] T2 — S2 — inline — pendiente
- [ ] T3 — S3 — inline — pendiente
- [ ] T4 — S4 — inline — pendiente
- [ ] T5 — S5 — inline — pendiente
- [ ] T6 — S6 — inline — pendiente
- [ ] T7 — S7 — inline — pendiente

## Log

- L1 (2026-11-28, pedido original, verbatim): "Crea vanilla-spa-core. Ahora al tener 2 motores el framework: jq-spa-core y vanilla-spa-core. Cuando el desarrollador utilice el framework, elegirá un motor u otro para el desarrollo, no pueden vivir juntos los dos motores. Tendrá que haber una opción o configuración para elegir uno u otro para el desarrollo."
- L2 (2026-11-28, decisión del usuario): selector en `spa.config.js` → `engine: 'jquery' | 'vanilla'` con plantillas por motor en `src/engines/` y shell con marcadores. El demo actual queda jQuery por defecto.
- L3 (2026-11-28, aclaración del usuario): `src/routes/` es compartido; `libs` es jQuery-only y en vanilla debe quedar vacío o ausente. La spec queda fuera de alcance.
- L4 (2026-11-28, entrega): PR2 encadenada sobre `spec-06-vanilla-spa-core`; al mergear PR1 se retargetea a `main`.
