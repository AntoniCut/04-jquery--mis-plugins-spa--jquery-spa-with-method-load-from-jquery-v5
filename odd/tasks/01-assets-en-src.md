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
- [x] T2 — S2 — inline — `spec-01-step-02`
- [ ] T3 — S3 — inline
- [ ] T4 — S4 — inline
- [ ] T5 — S5 — inline
- [ ] T6 — S6 — inline

## Log

- L1 (2026-11-22): `/spec-impl @specs/01-assets-en-src.md`
- L2 (2026-11-22): T1. `pnpm refresh` termina sin errores, `copyAssets` corre y `diff -rq src/assets app/assets` no muestra diferencias. `convertImages` informa "No hay PNG en src/assets/img/clase-*" porque no existen carpetas `clase-*`. `listClasePngSources()` también leía `assets/img` a mano: ahora usa `paths.src.assetsDir`.
- L3 (2026-11-22): T2. 21 URLs cambiadas (1 en `paths.js`, 2 en `index.html`, 18 en `_monserrat.scss`). En `pnpm dev` (puerto 9877, el 9876 estaba ocupado) responden 200 `app/assets/img/logos/jquery/jquery-loader.svg`, `app/assets/favicon/jquery-icon.svg` y Montserrat 600, 700 y regular. Siguen 7 errores 404 en `assets/img/logos/...` del header, el footer y el navbar de themes: son el alcance de T3.
