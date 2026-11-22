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
- [x] T3 — S3 — inline — `spec-01-step-03`
- [x] T4 — S4 — inline — `spec-01-step-04`
- [ ] T5 — S5 — inline
- [ ] T6 — S6 — inline

## Log

- L1 (2026-11-22): `/spec-impl @specs/01-assets-en-src.md`
- L2 (2026-11-22): T1. `pnpm refresh` termina sin errores, `copyAssets` corre y `diff -rq src/assets app/assets` no muestra diferencias. `convertImages` informa "No hay PNG en src/assets/img/clase-*" porque no existen carpetas `clase-*`. `listClasePngSources()` también leía `assets/img` a mano: ahora usa `paths.src.assetsDir`.
- L3 (2026-11-22): T2. 21 URLs cambiadas (1 en `paths.js`, 2 en `index.html`, 18 en `_monserrat.scss`). En `pnpm dev` (puerto 9877, el 9876 estaba ocupado) responden 200 `app/assets/img/logos/jquery/jquery-loader.svg`, `app/assets/favicon/jquery-icon.svg` y Montserrat 600, 700 y regular. Siguen 7 errores 404 en `assets/img/logos/...` del header, el footer y el navbar de themes: son el alcance de T3.
- L4 (2026-11-22): el usuario reporta "no se ven los logos del header" tras T2. Era el estado intermedio esperado: se corrige en T3.
- L5 (2026-11-22): T3. 16 URLs cambiadas (7 en el header, 7 en el footer, 2 en el navbar de themes). Tras recargar `pnpm dev`: 0 errores en consola, los 7 logos del layout responden desde `app/assets/img/logos/...` y cada URL se pide una sola vez. Dos `<img loading="lazy">` de `#linksThemesContainer` quedan sin descargar porque ese menú está cerrado; su URL es la correcta.
- L6 (2026-11-22): T4. Eliminé el bloque `paths.root` entero (solo tenía `assetsDir` y `assets`), la tarea `copyRootAssetsToDist` y su uso en `build`, y `'assets/**/*'` de `BROWSER_SYNC_FILES`. `node --check` pasa en los dos archivos. `pnpm build` termina con código 0, `diff -rq src/assets dist/app/assets` no muestra diferencias y `dist/assets/` no existe.
