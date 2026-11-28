# SPEC 06 — `@antonydev/vanilla-spa-core`

> **Estado:** Aprobado
> **Depende de:** SPEC 04 implementada (`specs/04-jq-spa-core.md`), SPEC 05 implementada (`specs/05-spa-loading-effect.md`)
> **Referencia:** plugin `spa-loader-content-html` v5 de JS-SPA-V5 (`spa-loader-content-html-v5/src/plugins/spa-loader-content-html/v5/spa-loader-content-html.js`) y `workflow/2026-11-28-js-spa-v5-pendiente.md`
> **Fecha:** 2026-11-28
> **Objetivo:** Extraer el motor SPA vanilla del plugin de JS-SPA-V5 a `@antonydev/vanilla-spa-core`, con el mismo contrato de rutas y opciones del proyecto, sin jQuery y sin acoplarse al API Node.

## Por qué existe

El monorepo ya empaqueta el motor jQuery (`jq-spa-core`); el motor vanilla vive duplicado en JS-SPA-V5 y no se puede reutilizar. `src/routes/` es compartido por ambos motores: la única entrada específica de jQuery es `libs` (módulos jQuery UI). El motor vanilla debe ignorarla; el soporte de librerías vanilla va en otra spec.

El `workflow/2026-11-28-js-spa-v5-pendiente.md` solo documenta el artefacto `.deploy-api/` y el paquete `javascript-node-api` de JS-SPA-V5. No define el motor vanilla ni el API de este repo (`jquery-node-api`).

## Alcance

**Entra:**

- Crear `packages/vanilla-spa-core/` con nombre npm `@antonydev/vanilla-spa-core` (`"type": "module"`, `"private": true`), `src/start.js`, `src/spa-loader-content-html.js`, `types/` y `test/`.
- Registrar el paquete en `pnpm-workspace.yaml` y `"@antonydev/vanilla-spa-core": "workspace:*"` en `devDependencies` de la raíz.
- API pública:
    - `spaLoaderContentHtml(options)` — fiel a la referencia; opciones `{ routeManifest, routeModulesBase, base }`.
    - `start(options)` — entrada del paquete; si recibe `initSpa`, lo invoca; si recibe las opciones del motor, llama a `spaLoaderContentHtml`.
    - `spaLoaderContentHtml` reexportado desde `start.js`.
- Portar el comportamiento de la referencia:
    - `init()`: ruta inicial desde el manifiesto, 404 y `history.replaceState`.
    - Normalización de `base`/pathnames/slashes, `routeCache`, `brokenRouteModules`.
    - Import dinámico de módulos de ruta.
    - `fetch` de HTML y reescritura de `src`/`href`/`poster`/`srcset`.
    - `loadContent` en 3 fases con View Transitions y `AbortController`.
    - Inyección en orden: `components` → `pagesComponents` → `MarkdownShikiHtml`.
    - Metadatos: `pageTitle`, `favicon`, `headerTitle`, `styles`, `scripts`.
    - Eventos `spa:route-loaded`, `spa:first-route-loaded`, `spa:route-load-error`.
    - Click en `a[data-id], a[data-route]`, `popstate`, modificadores y botones del navbar vanilla (`actionsNavbar`, `slideDown`, `slideUp`).
    - Guardas de navegación concurrente y aborto de la FASE 3.
- Adaptaciones al contrato de este repo:
    - `components` acepta claves con selector CSS (`#layoutHeader`, `.clase`, `[data-x]`) o id pelado (`layoutHeader`).
    - `scripts` acepta `{ type: 'module' }` y `{ isModule: true }`.
    - `libs` se ignora; el desarrollador no debe declararlo en vanilla.
    - `MarkdownShikiHtml`/`pagesComponents` opcionales.
    - Sin `innerHTML`: `DOMParser` + `DocumentFragment` + `replaceChildren`/`textContent`.
- Tipos: `VanillaSpaCoreOptions`, `VanillaSpaCoreStartOptions`, `VanillaSpaCoreRoute`, `VanillaSpaCoreRouteManifest` y `VanillaSpaCorePreloadPayload`; `vanilla-spa-core-package.d.ts` con los módulos `@antonydev/vanilla-spa-core`, `/start.js` y `/spa-loader-content-html.js`. `jsconfig.json` incluye `packages/vanilla-spa-core`.
- Fixture de verificación: `test/fixture/` y `test/server.js` (Node, sin dependencias) con rutas de ejemplo, components, pagesComponents, MarkdownShiki, estilos, scripts, 404, back/forward y clics rápidos.
- Actualizar `specs/arquitectura/01-framework-en-paquetes.md` con el paquete y la decisión.

**Fuera de alcance:**

- Selector de motor, `spa.config.js` → `engine`, `src/engines/`, shell y spa-build/spa-server: SPEC 07 (`specs/07-selector-de-motor.md`).
- Soporte de librerías vanilla (equivalente a `libs`): spec futura.
- Demo vanilla completa en el sitio: spec futura.
- Cambios en `api/`, `.deploy-api/`, `javascript-node-api`, deploy, Nginx o MySQL.
- Publicar en npm.
- Framework de tests automatizados; `pnpm test` sigue siendo placeholder.

## Modelo de datos

```js
/**
 * @typedef {Object} VanillaSpaCoreOptions
 * @property {VanillaSpaCoreRouteManifest[]} [routeManifest]
 * @property {string} [routeModulesBase]
 * @property {string} base
 */

/**
 * @typedef {Object} VanillaSpaCoreStartOptions
 * @property {() => void} [initSpa]
 * @property {VanillaSpaCoreRouteManifest[]} [routeManifest]
 * @property {string} [routeModulesBase]
 * @property {string} [base]
 */
```

Payload interno:

```js
{
    components: Array<{ el: HTMLElement, fragment: DocumentFragment } | { el: HTMLElement, hide: true }>,
    pageComponents: Array<{ target: string, fragment: DocumentFragment }>,
    markdownShiki: Array<{ target: string, fragment: DocumentFragment }>,
}
```

Eventos:

- `spa:route-loaded` → `{ detail: { route: { id, path } } }`.
- `spa:first-route-loaded` → sin detalle, una sola vez.
- `spa:route-load-error` → `{ detail: { id, path, source, message } }`.

## Plan de implementación

1. Esqueleto del paquete, workspace, dependencia raíz, tipos y `jsconfig`. `pnpm install`.
2. `src/start.js` + `src/spa-loader-content-html.js`: opciones, normalización, manifiesto, import dinámico, 404 e `init`.
3. Fetch/preload, reescritura de URLs e inyección con `DocumentFragment`; `components` con selector o id.
4. Metadatos (`pageTitle`, `favicon`, `headerTitle`, `styles`, `scripts`) y `applyRouteMetaSync`/`applyRouteMetaAsync`.
5. Navegación: click `a[data-id], a[data-route]`, `popstate`, View Transitions, `AbortController` y eventos.
6. Navbar vanilla (`actionsNavbar`, `slideDown`, `slideUp`) y cierre por clic fuera.
7. Fixture + `test/server.js`; verificación con Playwright.
8. Actualizar arquitectura/AGENTS y cerrar ODD.

Cada paso deja el paquete sintácticamente válido y el fixture avanzando.

## Criterios de aceptación

- [ ] `packages/vanilla-spa-core/` existe y `pnpm install` lo resuelve como workspace.
- [ ] `spaLoaderContentHtml(options)` y `start({ initSpa })` funcionan según el contrato.
- [ ] `node --check` termina con código 0 en los JS del paquete.
- [ ] `rg 'innerHTML' packages/vanilla-spa-core` no encuentra asignaciones en el código (solo texto de docs si aplica).
- [ ] `rg 'jquery|@antonydev/jq-spa-core|javascript-node-api|api/' packages/vanilla-spa-core` no encuentra imports ni dependencias.
- [ ] El fixture carga la ruta inicial y pinta `components`, `pagesComponents` y `MarkdownShikiHtml`.
- [ ] Click `a[data-id]` navega sin recargar, actualiza URL, título, favicon, header/footer y estilos.
- [ ] Click `a[data-route]` navega por archivo de ruta.
- [ ] Back/forward carga la ruta correcta sin `pushState` duplicado.
- [ ] Ruta desconocida carga la 404.
- [ ] `spa:route-loaded`, `spa:first-route-loaded` y `spa:route-load-error` emiten el detalle esperado.
- [ ] Clics rápidos abortan la navegación anterior sin errores no capturados.
- [ ] Una ruta con `components` en formato `#id` y otra con id pelado funcionan.
- [ ] Una ruta con `scripts` `type: 'module'` y otra con `isModule: true` funcionan.
- [ ] Una ruta con `libs` no rompe el motor vanilla (se ignora).
- [ ] `git diff` no toca `api/`, `.deploy-api/`, `infra/` ni el deploy.

## Decisiones

- **Sí:** port fiel de la referencia en un solo archivo de motor (`spa-loader-content-html.js`) y `start.js` fino. Reduce el riesgo de deriva; la división en módulos va en otra spec.
- **Sí:** `spaLoaderContentHtml` + `start({ initSpa })`. Mantiene la API de la referencia y la simetría con `jq-spa-core`.
- **Sí:** `components` acepta selector o id pelado. El repo usa `#id`; la referencia usa id pelado.
- **Sí:** `scripts` acepta `type: 'module'` e `isModule`. El repo usa `type`; la referencia usa `isModule`.
- **Sí:** `libs` se ignora en silencio. El contrato compartido de `src/routes/` lo declara para jQuery; en vanilla el desarrollador no debe usarlo. Un warning por navegación sería ruido.
- **Sí:** `DOMParser` + `DocumentFragment` en vez de `innerHTML`.
- **No:** jQuery, jQuery UI, themes, draggable ni `libLoader`.
- **No:** cargar `libs` vanilla en esta spec.
- **No:** tocar `api/` o el deploy.
- **No:** publicar en npm.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Deriva respecto de la referencia | Port fiel + fixture con los flujos críticos; diff contra la referencia. |
| `innerHTML` reemplazado por fragmentos cambia el comportamiento | Fixture con HTML real, imágenes relativas, `srcset` y estilos. |
| Claves de `components` en dos formatos | Resolver único probado con `#id` e id pelado. |
| View Transitions no soportadas | Fallback a mutación directa, como la referencia. |
| Rutas del demo con `libs` bajo vanilla | Se ignoran; el demo queda jQuery por defecto; la spec de libs vanilla lo retoma. |
| `jsconfig` estricto | JSDoc + casts; `node --check` y fixture. |
| PR grande | Port fiel; `size:exception` o división posterior. |

## Qué **no** entra en esta spec

- Selector de motor y publicación (SPEC 07).
- Librerías vanilla.
- Demo vanilla completa.
- API Node, deploy, Nginx ni MySQL.
- Publicación en npm.

Cada uno de esos cambios, si se necesita, va en su propia spec.
