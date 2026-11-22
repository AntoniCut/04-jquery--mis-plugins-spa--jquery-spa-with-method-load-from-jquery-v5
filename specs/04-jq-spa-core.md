# SPEC 04 — `@antonydev/jq-spa-core`

> **Estado:** En progreso (paso 1)
> **Depende de:** SPEC 03 implementada (`specs/03-spa-build.md`)
> **Referencia:** SPEC 04 en `specs/arquitectura/01-framework-en-paquetes.md`
> **Fecha:** 2026-11-22
> **Objetivo:** Empaquetar jQuery (classic y módulo), los loaders, el plugin SPA v5 y la lógica de arranque de `src/main.js` en `@antonydev/jq-spa-core`; publicar el runtime del navegador bajo `app/framework/jq-spa-core/`; añadir **import map** en `index.html`; dejar `src/main.js` como entrada mínima que llama a `start()` con la config del sitio.

## Por qué existe

Tras SPEC 03, el motor de build ya es un paquete, pero el **núcleo de la SPA en el navegador** sigue repartido: `src/libs/jquery*`, `src/libs/jquery-module/`, el plugin en `src/plugins/spa-with-method-load-from-jquery/v5/` y ~140 líneas de bootstrap en `src/main.js`. Además Gulp copia jQuery desde `node_modules` y desde `src/libs/` por caminos distintos.

SPEC 04 unifica ese motor en un paquete workspace, alinea la arquitectura con **import map + `app/framework/`** y prepara el prototipo para copiarse a JS-SPA-V5 sin arrastrar vendors a mano.

## Alcance

**Entra:**

- Crear `packages/jq-spa-core/` con nombre npm `@antonydev/jq-spa-core` (`"type": "module"`, `"private": true` en el piloto).
- Registrar el paquete en `pnpm-workspace.yaml` y `"@antonydev/jq-spa-core": "workspace:*"` en `devDependencies` de la raíz (solo desarrollo / resolución del workspace; el navegador no importa desde `node_modules`).
- Mover con `git mv` al paquete (rutas sugeridas bajo `packages/jq-spa-core/src/`):
    - `src/libs/jquery/` → runtime classic (CDN fallback, locales, themes UI copiados hoy a `app/libs/jquery/`).
    - `src/libs/jquery-module/` → loaders ESM y módulos UI que hoy Gulp copia desde `node_modules` + `src/libs/jquery-module/jquery-ui/`.
    - `src/plugins/spa-with-method-load-from-jquery/v5/` → plugin `spaWithMethodLoadFromJQuery` (contrato `jQuery.load()` / `.html()` intacto).
- Extraer de `src/main.js` la lógica de arranque a **`start(options)`** en el paquete (p. ej. `packages/jq-spa-core/src/start.js`):
    - Modo **`isJQueryModule`** (default `true`, como hoy): `loadJQueryCoreByImport` → registrar plugin → `options.initSpa()` → `preloadAllJQueryUI` en `window` `load`.
    - Modo classic: `fallbackJQueryJQueryUI()` → registrar plugin → `options.initSpa()`.
    - Errores y mensajes de consola equivalentes al `main.js` actual (sin `alert`/`confirm`).
    - El paquete **no** importa `src/spa/spa.js` ni rutas del proyecto; solo invoca el callback `initSpa` que pasa el desarrollador.
- Reducir **`src/main.js`** del proyecto a:
    - `effectLoadingPage()` (**sigue aquí hasta SPEC 05**; no bloquea esta spec).
    - `export { base } from './routes/paths.js'` (compatibilidad).
    - `import { start } from '@antonydev/jq-spa-core'`.
    - `import { spa } from './spa/spa.js'`.
    - `start({ isJQueryModule: true, initSpa: spa })` (u objeto de opciones documentado en tipos).
- **`index.html`**: bloque `<script type="importmap">` **antes** de `<script type="module" src="app/main.js">`, con URLs **relativas al `<base href>`** (p. ej. `app/framework/jq-spa-core/...`). Entradas mínimas del piloto:
    - `@antonydev/jq-spa-core` → punto de entrada `start.js` (o subpath acordado en `exports` del paquete).
    - Subpaths internos solo si hace falta (p. ej. loaders usados desde `src/spa/spa.js`); preferir que el código del sitio importe por nombre del map, no rutas `app/framework/...` en fuentes.
- **`@antonydev/spa-build`**:
    - Nueva tarea (o extensión de `spa.config.js`) que copia el árbol publicable del paquete a `app/framework/jq-spa-core/` en cada `refresh` / `build`.
    - **Dejar de copiar** a `app/libs/jquery-module/` desde `node_modules` lo que pase a vivir en el framework del core (retirar o vaciar `vendor.jquery*` en `spa.config.js` cuando el paquete publique esos archivos).
    - Mantener copia de **themes** y assets jQuery classic que el HTML preload siga pidiendo (`app/libs/jquery/ui/themes/base/jquery-ui.min.css`, etc.), salvo que esta spec mueva también esas URLs al framework con actualización de `index.html`.
- Ajustar **`src/spa/spa.js`**: imports que hoy apuntan a `../libs/jquery-module/loader/...` deben resolver vía **import map** (`@antonydev/jq-spa-core/...`) tras copiar `spa.js` a `app/spa/`.
- Declarar `exports` en `package.json` del paquete para Node/tests y documentar el mapa del navegador (no hace falta que el navegador resuelva `exports` de npm).
- Tipos: `types/jq-spa-core-start.d.js` (o dentro del paquete) con `@typedef` de `JqSpaCoreStartOptions`.
- Actualizar `jsconfig.json` con `packages/jq-spa-core` y, si hace falta, ampliar `types/spa-build-package.d.ts` o nuevo `.d.ts` para `@antonydev/jq-spa-core` en checkJs del `main.js` del proyecto.
- Documentar en README / AGENTS el import map y `app/framework/jq-spa-core/`.

**Decisión explícita (arquitectura pendiente):**

- **`src/plugins/actions-navbars-with-jquery-jquery-ui/`** — **No entra** al core. Queda en `src/plugins/` como ejemplo de plugin de terceros del curso; la SPA v5 activa sigue usando `actionsNavbar()` del plugin principal.

**Fuera de alcance (SPEC 05+):**

- SPEC 05 — `@antonydev/spa-loading-effect` (`effectLoadingPage` sigue importado desde `src/effects/` en `main.js`).
- Publicar en npm.
- Bundler, Vite ni esbuild.
- Cambiar el contrato del plugin (`load` / `.html()`), el manifiesto de rutas o las vistas.
- Mover `src/spa/spa.js` al paquete (sigue siendo configuración del desarrollador).

## Modelo de datos — `start(options)`

```js
// Uso previsto en src/main.js (proyecto)
import { start } from '@antonydev/jq-spa-core';
import { spa } from './spa/spa.js';

start({
    isJQueryModule: true,
    initSpa: spa,
});
```

```js
/**
 * @typedef {Object} JqSpaCoreStartOptions
 * @property {boolean} [isJQueryModule=true] - true: ESM desde framework; false: fallback CDN → local classic.
 * @property {() => void} initSpa - Registra el plugin y arranca la SPA del sitio (hoy `spa()` en spa.js).
 */
```

## Import map (extracto)

El HTML del desarrollador declara algo equivalente (rutas relativas al `<base>`):

```html
<script type="importmap">
{
    "imports": {
        "@antonydev/jq-spa-core": "app/framework/jq-spa-core/start.js"
    }
}
</script>
```

Subpaths adicionales se añaden solo donde `app/spa/spa.js` u otros módulos del sitio importen loaders del core por nombre. `%SITE_BASE%` no va dentro del JSON del map; el `<base href>` resuelve las URLs relativas.

## Contrato del paquete (extracto)

```js
// packages/jq-spa-core/package.json (extracto)
{
  "name": "@antonydev/jq-spa-core",
  "exports": {
    "./start.js": "./src/start.js",
    "./package.json": "./package.json"
  }
}
```

## Plan de implementación

1. Esqueleto `packages/jq-spa-core`, workspace, `pnpm install`. Tipos `JqSpaCoreStartOptions`.
2. `git mv` libs jQuery, jquery-module y plugin v5 al paquete; corregir imports internos relativos dentro del paquete.
3. Implementar `start.js` (extracción fiel de `main.js`); tests manuales en consola (mensajes de carga jQuery / UI).
4. Tarea Gulp / `spa.config.js` → `copyFrameworkJqSpaCore`; retirar copia vendor duplicada; `pnpm refresh` deja `app/framework/jq-spa-core/` completo.
5. Import map en `index.html`; reducir `src/main.js`; actualizar imports en `src/spa/spa.js`.
6. Docs, criterios de aceptación, verificación dev/preview/manifiesto.

## Criterios de aceptación

- [ ] Existe `packages/jq-spa-core/` como `@antonydev/jq-spa-core` en el workspace.
- [ ] No queda el plugin v5 ni los árboles movidos bajo `src/libs/jquery/` o `src/libs/jquery-module/` (salvo carpetas vacías o notas si se dejan de transición).
- [ ] `src/main.js` solo orquesta `effectLoadingPage`, reexport de `base`, `start()` e `initSpa: spa` (sin funciones `loadJQueryModule` / `loadJQueryClassic` locales).
- [ ] `index.html` incluye import map **antes** del `<script type="module">` de `app/main.js`.
- [ ] Tras `pnpm refresh`, existe `app/framework/jq-spa-core/` y el navegador carga la SPA sin error de resolución de módulos en consola.
- [ ] `pnpm dev` y `pnpm preview` (tras `build`): home + rutas del manifiesto sin 404 del shell; jQuery UI (datepicker, draggable, tooltips) sigue funcionando en las páginas que lo usan.
- [ ] `pnpm build` genera `dist/` con import map y carpeta `dist/app/framework/jq-spa-core/` (o rutas equivalentes bajo `dist/app/`).
- [ ] `src/plugins/actions-navbars-with-jquery-jquery-ui/` sigue en el repo y **no** se importa desde el core ni desde `main.js`.
- [ ] Ningún archivo en `packages/jq-spa-core/src/` importa estáticamente rutas bajo `src/` del proyecto (salvo `import()` dinámico si en el futuro hiciera falta, no requerido aquí).
- [ ] `rg 'jquery-module/jquery' app/` tras refresh: los entrypoints del core vienen de `app/framework/jq-spa-core/` o del map, no duplicados innecesarios en `app/libs/jquery-module/` por la misma versión vendor (criterio visual: una sola fuente de verdad documentada en AGENTS).

## Decisiones

- **Sí:** un solo paquete jQuery + plugin + `start()` (arquitectura).
- **Sí:** import map en `index.html`; URLs relativas al `<base>`.
- **Sí:** publicación a `app/framework/jq-spa-core/` vía spa-build (extender `spa.config.js` si hace falta sección `framework`).
- **Sí:** `actions-navbars` queda como plugin de terceros en `src/plugins/`.
- **No:** mover `effectLoadingPage` (SPEC 05).
- **No:** cambiar `src/spa/spa.js` a “solo opciones” en esta spec (sigue exportando `spa()`; solo cambian imports de loaders).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Import map tarde o mal ordenado | Test de consola en criterios; import map antes de `app/main.js` |
| `spa.js` en `app/` importa rutas viejas a `libs/` | Actualizar `src/spa/spa.js` y regenerar `app/` |
| Themes CSS en `index.html` apuntan a `app/libs/jquery` mientras JS sale del framework | Plan paso 4: o mover themes con el core o mantener copia explícita y documentar |
| Duplicar jQuery en `libs` y `framework` | Eliminar tareas vendor redundantes al cerrar la copia del framework |
| Preview sin map en `dist/index.html` | `minifyRootIndex` preserva import map; verificar en build |

## Qué **no** entra en esta spec

- `@antonydev/spa-loading-effect`, SPEC 06 documentación masiva del curso.
- Eliminar `jquery` / `jquery-ui` de `dependencies` del proyecto si aún hace falta para scripts Node o referencia de versión; revisar en paso de implementación sin romper `pnpm install`.
- Port a JS-SPA-V5.