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

- [ ] T1 — S1 — inline — pendiente
- [ ] T2 — S2 — inline — pendiente
- [ ] T3 — S3 — inline — pendiente
- [ ] T4 — S4 — inline — pendiente
- [ ] T5 — S5 — inline — pendiente
- [ ] T6 — S6 — inline — pendiente
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
