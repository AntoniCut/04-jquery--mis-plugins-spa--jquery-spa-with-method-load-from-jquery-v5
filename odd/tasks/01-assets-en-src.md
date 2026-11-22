# ODD — SPEC 01 `assets/` dentro de `src/`

Objetivo, alcance y criterios: `specs/01-assets-en-src.md` (fuente de verdad, no se copia aquí).
Rama: `spec-01-assets-en-src`. Entrega: una PR. Verificación: `pnpm refresh`, `pnpm dev`, `pnpm build`, `pnpm preview` y `rg`.

## Specs

- S1 — Paso 1 de la spec: `git mv`, `paths.src.assets*`, `claseImagesPng`, `copyAssets` en `buildSources` y watch.
- S2 — Paso 2: `paths.js`, `index.html` y `_monserrat.scss` a `app/assets/`.
- S3 — Paso 3: los tres HTML de `src/components/layout/` a `../../assets/`.
- S4 — Paso 4: quitar `paths.root.assets*`, `copyRootAssetsToDist` y `'assets/**/*'` de BrowserSync.
- S5 — Paso 5: `pnpm code-highlight`, README y `scriptsDoc`.
- S6 — Criterios de aceptación de la spec.

## Tasks

- [x] T1 — S1 — inline — `spec-01-step-01`
- [ ] T2 — S2 — inline
- [ ] T3 — S3 — inline
- [ ] T4 — S4 — inline
- [ ] T5 — S5 — inline
- [ ] T6 — S6 — inline

## Log

- L1 (2026-11-22): `/spec-impl @specs/01-assets-en-src.md`
- L2 (2026-11-22): T1. `pnpm refresh` termina sin errores, `copyAssets` corre y `diff -rq src/assets app/assets` no muestra diferencias. `convertImages` informa "No hay PNG en src/assets/img/clase-*" porque no existen carpetas `clase-*`. `listClasePngSources()` también leía `assets/img` a mano: ahora usa `paths.src.assetsDir`.
