# ODD — SPEC 06 `@antonydev/vanilla-spa-core`

Objetivo, alcance y criterios: `specs/06-vanilla-spa-core.md` (fuente de verdad, no se copia aquí).
Rama: `spec-06-vanilla-spa-core`. Entrega: una PR. Verificación: `node --check`, fixture con `node packages/vanilla-spa-core/test/server.js`, `pnpm install`, `pnpm build` y `rg`.

## Specs

- S1 — Paquete `packages/vanilla-spa-core/` en el workspace, dependencia raíz, `jsconfig` y tipos base.
- S2 — `start()` y `spaLoaderContentHtml(options)` con el contrato `{ routeManifest, routeModulesBase, base }`.
- S3 — Routing: manifiesto, import dinámico, normalización de base/pathnames, 404, `init` y `history.replaceState`.
- S4 — Fetch/preload, reescritura de `src`/`href`/`poster`/`srcset` e inyección con `DocumentFragment`.
- S5 — `components` con selector o id pelado; `scripts` con `type` o `isModule`; `libs` ignorado.
- S6 — Metadatos (`pageTitle`, `favicon`, `headerTitle`, `styles`, `scripts`), eventos y navbar vanilla.
- S7 — Navegación por click `a[data-id], a[data-route]`, `popstate`, View Transitions y `AbortController`.
- S8 — Fixture, `test/server.js`, verificación y cierre documental.

## Tasks

- [x] T1 — S1 — inline — pendiente de commit del usuario
- [x] T2 — S2 — inline — pendiente de commit del usuario
- [x] T3 — S3 — inline — pendiente de commit del usuario
- [x] T4 — S4 — inline — pendiente de commit del usuario
- [x] T5 — S5 — inline — pendiente de commit del usuario
- [x] T6 — S6 — inline — pendiente de commit del usuario
- [ ] T7 — S7 — inline — pendiente
- [ ] T8 — S8 — inline — pendiente

## Log

- L1 (2026-11-28, pedido original, verbatim): "Hay que implementar dentro de packages/ la funcionalidad "vanilla-spa-core". Toma de referencia el archivo dentro de workflow/ "2026-11-28-js-spa-v5-pendiente.md". Utilizar la misma api que utiliza el proyecto, preguntar en caso de duda, ya que en el archivo 2026-11-28-js-spa-v5-pendiente.md dice algo de api-node-javascript. Utiliza la metodologia ODD. crear las specs dentro de la carpeta specs. Siempre crear una rama, decir el nombre del commit y nombre y descripcion de la PR."
- L2 (2026-11-28, referencia funcional): el motor a portar es `spa-loader-content-html-v5/src/plugins/spa-loader-content-html/v5/spa-loader-content-html.js`. El `workflow/2026-11-28-js-spa-v5-pendiente.md` solo documenta el artefacto `.deploy-api/` y `javascript-node-api` de JS-SPA-V5; no aplica a este paquete.
- L3 (2026-11-28, aclaración del usuario): `src/routes/` sirve para jQuery y vanilla. La única entrada específica de jQuery es `libs`; en vanilla el desarrollador no debe declararla. El soporte de librerías vanilla va en una spec aparte.
- L4 (2026-11-28, decisión): el motor vanilla ignora `libs` en silencio, sin warning, para no ensuciar las rutas compartidas del demo. La spec futura de libs vanilla lo retoma.
- L5 (2026-11-28, decisión): se exponen `spaLoaderContentHtml(options)` y `start({ initSpa })`/`start(options)`; el primero mantiene la API de la referencia y el segundo la simetría con `jq-spa-core`.
- L6 (2026-11-28, decisión): sin `innerHTML`; se usa `DOMParser` + `DocumentFragment` + `replaceChildren`/`textContent`.
- L7 (2026-11-28, decisión): `components` acepta `#selector` o id pelado; `scripts` acepta `type: 'module'` e `isModule: true`.
- L8 (2026-11-28, entrega): PR1 encadenada, base `main`; PR2 (`spec-07-selector-de-motor`) depende de esta rama. `size:exception` previsto por el tamaño del port.
- L9 (2026-11-28, T1 verificado): `packages/vanilla-spa-core/package.json` creado como `@antonydev/vanilla-spa-core` (`type: module`, `private`, exports a `start.js` y `spa-loader-content-html.js`). `pnpm-workspace.yaml` incluye `packages/vanilla-spa-core`; la raíz declara `"@antonydev/vanilla-spa-core": "workspace:*"` en devDependencies; `jsconfig.json` incluye el paquete. Tipos base: `vanilla-spa-core-route.d.js`, `vanilla-spa-core-options.d.js`, `vanilla-spa-core-start.d.js` y `vanilla-spa-core-package.d.ts`. `pnpm install` → `Scope: all 7 workspace projects`, `+ @antonydev/vanilla-spa-core 0.0.0 <- packages/vanilla-spa-core`; `package.json`/`jsconfig.json` parsean como JSON. Falta el commit (lo hace el usuario).
- L10 (2026-11-28, T2 verificado): `src/start.js` exporta `start()` y reexporta `spaLoaderContentHtml`; `start({ initSpa })` invoca el callback y `start(options)` delega en el motor. `src/spa-loader-content-html.js` normaliza `{ routeManifest, routeModulesBase, base }` con defaults vacíos y deja `init()` listo para el routing. `node --check` en ambos archivos y prueba Node: `initSpa llamado: true`; el motor informa `rutas en el manifiesto: 1`. Falta el commit (lo hace el usuario).
- L11 (2026-11-28, T3 verificado): `spa-loader-content-html.js` suma `collapsePathnameSlashes`, `safeHistoryPathname`, `normalize`, `buildPathname`, `findManifestEntryByPath`, `findManifestEntryById`, `loadRouteModule` (caché + módulos rotos), `findNotFoundRoute`, `loadNotFoundRoute` e `init()` async con `history.replaceState`. `loadContent` queda como placeholder para T4. Prueba Node con módulos temporales en `/tmp/opencode/vanilla-t3`: home en `/` → `replaceState {id:"home",path:"/",routeFile:"route-home"}`; URL `/missing` → 404 + `replaceState {id:null,path:"/missing"}`; base `/app` y pathname `/app/home` → `replaceState {id:"home",path:"/app/home"}`. `node --check` OK. Falta el commit (lo hace el usuario).
- L12 (2026-11-28, T4 verificado): `spa-loader-content-html.js` suma `resolveContainer` (selector CSS o id pelado), `resolveInjectedAssetUrl`, `rewriteNodeAssetUrls` (`src`/`href`/`poster`/`srcset`), `parseHtmlFragment` (`DOMParser` + `DocumentFragment` + `importNode`, sin `innerHTML`), `createErrorFragment`, `fetchHtmlContent`, `preloadRouteContent`, `applyPreloadedContent` y `loadContent` real. Verificación Playwright con fixture temporal en `http://127.0.0.1:4173/`: header con `#layoutHeader`, main con id pelado `layoutMain`, page component `[data-component-page="hello"]`, bloque Shiki `[data-shiki="code"]`, footer; la imagen relativa `../assets/logo.svg` quedó como `/assets/logo.svg`; 404 en `/missing` pintó `#notFound`; 0 errores de consola. Falta el commit (lo hace el usuario).
- L13 (2026-11-28, T5 verificado): scripts de ruta implementados con `scriptSrcMatches`, `isScriptLoaded`, `removeLoadedScripts`, `loadScripts` y `applyRouteMetaAsync`. Acepta `type: 'module'` e `isModule: true`; los clásicos se re-ejecutan quitando el `<script>` previo; los módulos usan URL estable si hay `exportFunctionName` y única si renderizan en top-level. `route.libs` se ignora sin warning (jQuery-only). `loadContent` carga los scripts después de inyectar el DOM. Fixture temporal: `#classicMarker` → “Classic OK 1”, `#moduleMarker` → “Module OK 1”, `#legacyMarker` → “Legacy module OK”; `classicRuns=1`, `moduleRuns=1`; la ruta declaraba `libs` y no hubo errores de consola. Falta el commit (lo hace el usuario).
- L14 (2026-11-28, T6 verificado): metadatos, eventos y navbar implementados. `applyRouteMetaSync` actualiza `pageTitle`, `favicon` (cache-busting por sesión), `headerTitle` en `#layoutHeader #headerTitle`/`#layoutFooter #footerTitle` y `styles` (`link[data-page-style="true"]`); se llama desde `applyPreloadedContent` con y sin components. `notifyRouteLoaded` emite `spa:route-loaded` + `spa:first-route-loaded`; `notifyRouteLoadError` emite `spa:route-load-error` y desbloquea el loader; `loadContent` captura y notifica. Navbar vanilla con `actionsNavbar`, `slideDown` y `slideUp`; se llama tras inyectar components y cierra al hacer clic fuera. Fixture temporal: `title=Home`, `headerTitle=Home`, `footerTitle=Home`, `link[data-page-style]` → `/assets/page.css?t=...`, favicon → `/assets/logo.svg?v=...`, eventos `route-loaded` + `first-route-loaded`; navbar abrió (`display:block`, `marginTop:0`, `btnClose:flex`, body overflow hidden) y cerró (`display:none`, `btnOpen:flex`, overflow vacío); 0 errores de consola. Falta el commit (lo hace el usuario).
