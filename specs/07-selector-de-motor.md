# SPEC 07 — Selector de motor y publicación

> **Estado:** Aprobado
> **Depende de:** SPEC 06 (`specs/06-vanilla-spa-core.md`)
> **Referencia:** `specs/arquitectura/01-framework-en-paquetes.md`, `spa.config.js`, `packages/spa-build`, `packages/spa-server`
> **Fecha:** 2026-11-28
> **Objetivo:** Elegir `jquery` o `vanilla` desde `spa.config.js` y hacer que dev/build publiquen solo el motor elegido, sin mezclar ambos en `app/` ni en `dist/`.

## Por qué existe

Con dos motores, el framework no puede publicar los dos a la vez: el desarrollador elige uno para su proyecto. `src/routes/` es compartido; la única diferencia es `libs` (jQuery UI), que vanilla ignora. El selector no toca las rutas y el demo actual queda en jQuery por defecto.

## Alcance

**Entra:**

- `spa.config.js` y `.example`: `engine: 'jquery' | 'vanilla'` (default `'jquery'`), `framework.vanillaSpaCore` y `framework.vanillaSpaCoreApp`.
- `src/engines/jquery/` y `src/engines/vanilla/` con `main.js` y `spa.js`; retirar `src/main.js` y `src/spa/`.
    - jQuery: `start({ isJQueryModule: true, initSpa: spa })`; `spa()` usa `$layout.spaWithMethodLoadFromJQuery`.
    - Vanilla: `start({ initSpa: spa })`; `spa()` usa `spaLoaderContentHtml`.
    - Imports relativos `../../routes` y `../../config` funcionan en `src/engines/<engine>/` y en `app/engines/<engine>/`.
- `packages/spa-build`:
    - Tipos `SpaBuildEngine`, `SpaBuildConfig.engine`, `SpaBuildFramework.vanillaSpaCore*`, paths `engine`/`vanillaSpaCore`.
    - `copyEngine` (copia `src/engines/<engine>/**/*` → `app/engines/<engine>/`).
    - `copyFrameworkVanillaSpaCore`.
    - Copia condicional: jQuery → `copyFrameworkJqSpaCore` + `copyVendorModules`; vanilla → `copyFrameworkVanillaSpaCore`; siempre `copyFrameworkSpaLoadingEffect`.
    - `buildSources`, `copyAll`, `watchSrc` y exports condicionales.
    - `minifyRootIndex` filtra el shell por motor antes de `%SITE_BASE%` y htmlmin.
- `packages/spa-server`:
    - `src/engine-shell.js` con `resolveEngineShell(html, engine)`.
    - Export `./engine-shell.js` en `package.json`.
    - `dev-server.js` lee `spa.config.js`, filtra `index.html` y sirve solo el motor elegido.
    - `preview` sigue sirviendo `dist/index.html` ya filtrado.
- `index.html`:
    - Bloques `<!-- @engine:jquery:start --> ... <!-- @engine:jquery:end -->` y `<!-- @engine:vanilla:start --> ... <!-- @engine:vanilla:end -->`.
    - jQuery: preload/stylesheet de jQuery UI themes, import map `@antonydev/jq-spa-core` + `/` + `@antonydev/spa-loading-effect`, entry `app/engines/jquery/main.js`.
    - Vanilla: import map `@antonydev/vanilla-spa-core` + `/` + `@antonydev/spa-loading-effect`, entry `app/engines/vanilla/main.js`.
    - El resto del shell (base, loader, layout, globals) queda compartido.
- `jsconfig`, `AGENTS.md`, `README.md`, `specs/arquitectura/01-framework-en-paquetes.md`.

**Fuera de alcance:**

- Cambiar `src/routes/`, `src/pages/`, `src/pages-components/`, `src/components/` ni `src/scss/`.
- Soporte de `libs` vanilla.
- Demo vanilla completa.
- `api/`, deploy, Nginx ni MySQL.
- Publicar en npm.
- Cambiar el contrato de `spa-loading-effect`.

## Modelo de datos

```js
// spa.config.js
engine: 'jquery', // 'jquery' | 'vanilla'
framework: {
    jqSpaCore: 'packages/jq-spa-core/src',
    jqSpaCoreApp: 'app/framework/jq-spa-core',
    vanillaSpaCore: 'packages/vanilla-spa-core/src',
    vanillaSpaCoreApp: 'app/framework/vanilla-spa-core',
    spaLoadingEffect: 'packages/spa-loading-effect/src',
    spaLoadingEffectApp: 'app/framework/spa-loading-effect',
}
```

Helper:

```js
resolveEngineShell(html, engine)
// Conserva el bloque del motor elegido, elimina el otro y los marcadores.
```

## Plan de implementación

1. Specs/ODD, rama y `spa.config.js` + `.example` con `engine` y `framework.vanillaSpaCore*`.
2. Mover `src/main.js`/`src/spa/spa.js` a `src/engines/jquery/`; crear `src/engines/vanilla/main.js` y `spa.js`; ajustar imports y quitar `src/main.js`/`src/spa/`.
3. `spa-build`: tipos, `buildPaths`, `copyEngine`, `copyFrameworkVanillaSpaCore`, condicionales en `buildSources`/`copyAll`/`watchSrc` y `minifyRootIndex`.
4. `spa-server`: `engine-shell.js`, export y lectura de `spa.config.js` en `dev-server.js`.
5. `index.html`: bloques de motor, import maps y entry.
6. `jsconfig`, `AGENTS.md`, `README.md` y `specs/arquitectura/01...`.
7. Verificación con `engine: 'jquery'` y `engine: 'vanilla'`.

Cada paso deja `pnpm refresh`/`pnpm build` funcionando para el motor jQuery.

## Criterios de aceptación

- [ ] `spa.config.js` expone `engine` con default `'jquery'`; un valor inválido falla con error claro.
- [ ] `engine: 'jquery'`: `pnpm dev` y `pnpm preview` mantienen el demo actual; `app/framework/` solo tiene `jq-spa-core` + `spa-loading-effect`; el `index.html` servido tiene solo el import map/entry jQuery.
- [ ] `engine: 'vanilla'`: `pnpm refresh` deja `app/framework/vanilla-spa-core/` + `spa-loading-effect`; `app/framework/jq-spa-core/` no existe; el `index.html` servido tiene solo el import map/entry vanilla.
- [ ] `pnpm build` con vanilla incluye `dist/app/framework/vanilla-spa-core/` y no `dist/app/framework/jq-spa-core/`; con jQuery, al revés.
- [ ] `pnpm dev` con vanilla sirve `app/engines/vanilla/main.js` y el fixture del paquete sigue funcionando.
- [ ] `src/routes/` no cambia; `libs` se ignora en vanilla.
- [ ] Cambiar `engine` requiere reiniciar `pnpm dev` y está documentado.
- [ ] `pnpm build` y `pnpm preview` del demo jQuery siguen sin errores de consola.
- [ ] No queda `src/main.js` ni `src/spa/`; `copyMain`/`copySpa` no existen.
- [ ] `index.html` crudo tiene dos bloques; el servido/build tiene uno solo.
- [ ] `AGENTS.md`/`README.md` documentan `engine`, `src/engines/`, import maps y la exclusividad.

## Decisiones

- **Sí:** `spa.config.js` → `engine`. Es configuración de proyecto/build; `.env` queda para puertos y `SITE_BASE`.
- **Sí:** `src/engines/<engine>/main.js` + `spa.js`. Cada motor tiene su entrada y su config; el build copia solo el elegido.
- **Sí:** shell con marcadores. Un solo `index.html` mantiene el layout compartido.
- **Sí:** helper compartido en `spa-server`. Evita duplicar el parser de bloques en dev y build.
- **Sí:** el demo actual queda jQuery por defecto.
- **Sí:** `libs` se ignora en vanilla; el desarrollador no debe declararlo.
- **No:** dos shells separados. Duplicarían el layout.
- **No:** runtime switch. Los motores no conviven.
- **No:** tocar `src/routes/`.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El shell crudo tiene dos import maps | El dev/build siempre filtran; el crudo no se sirve. |
| Cambiar `engine` en caliente deja `app/` inconsistente | Reiniciar `pnpm dev`; documentado. |
| Rutas compartidas con `libs` bajo vanilla | Se ignoran; spec futura de libs vanilla. |
| `src/engines` con imports relativos | Misma profundidad en `src/` y `app/`; verificado con refresh/build. |
| Dependencia circular spa-build ↔ spa-server | `spa-build` ya depende de `spa-server`; el helper es puro. |
| Regresión del demo jQuery | Verificación dev/preview y `pnpm build`. |

## Qué **no** entra en esta spec

- Libs vanilla.
- Demo vanilla completa.
- API, deploy, Nginx ni MySQL.
- Publicación en npm.
- Cambios de rutas o páginas.

Cada uno de esos cambios, si se necesita, va en su propia spec.
