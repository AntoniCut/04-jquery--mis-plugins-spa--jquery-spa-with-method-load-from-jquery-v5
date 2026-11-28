/*
    *  -------------------------------------------------------------------------------------------  *
    *  -----  vanilla-spa-core-route.d.js  --  /packages/vanilla-spa-core/types/vanilla-spa-core-route.d.js  -----  *
    *  -------------------------------------------------------------------------------------------  *
*/


/**
 * ------------------------------------------
 * -----  `VanillaSpaCoreRouteComponents`  -----
 * ------------------------------------------
 * - Mapa de componentes HTML del layout.
 * - La clave puede ser un selector CSS (`#layoutHeader`, `.clase`, `[data-x]`) o un id pelado.
 * @typedef {Record<string, string|undefined>} VanillaSpaCoreRouteComponents
 */



/**
 * -------------------------------------------
 * -----  `VanillaSpaCorePageComponent`  -----
 * -------------------------------------------
 * - Componente HTML que se inyecta dentro de la página actual.
 * @typedef {Object} VanillaSpaCorePageComponent
 * @property {string} url - URL del archivo HTML.
 * @property {string} target - Selector CSS del contenedor destino.
 */



/**
 * ------------------------------------
 * -----  `VanillaSpaCoreRouteStyle`  -----
 * ------------------------------------
 * - Hoja de estilos asociada a una ruta.
 * @typedef {Object} VanillaSpaCoreRouteStyle
 * @property {string} href - URL del archivo CSS.
 */



/**
 * -------------------------------------
 * -----  `VanillaSpaCoreRouteScript`  -----
 * -------------------------------------
 * - Script asociado a una ruta.
 * - Acepta `type: 'module'` (contrato del repo) o `isModule: true` (referencia JS-SPA-V5).
 * @typedef {Object} VanillaSpaCoreRouteScript
 * @property {string} src - URL del archivo JS.
 * @property {'classic'|'module'} [type] - Tipo de carga. Por defecto `classic`.
 * @property {boolean} [isModule] - Alias de `type: 'module'`.
 * @property {string|null} [exportFunctionName] - Función exportada que se ejecuta tras importar un módulo.
 */



/**
 * -----------------------------------------------
 * -----  `VanillaSpaCoreMarkdownShikiEntry`  -----
 * -----------------------------------------------
 * - Bloque HTML resaltado con Shiki que se inyecta en la ruta.
 * @typedef {Object} VanillaSpaCoreMarkdownShikiEntry
 * @property {string} fileName - Nombre del archivo `.html` generado.
 * @property {string} [fileExtension] - Tipo de fuente resaltada.
 * @property {string} [urlInput] - URL del fuente original.
 * @property {string} urlOutput - URL de la carpeta donde se sirve el `.html` generado.
 * @property {string} target - Selector CSS del contenedor destino.
 */



/**
 * ------------------------------
 * -----  `VanillaSpaCoreRoute`  -----
 * ------------------------------
 * - Configuración de una ruta del motor vanilla.
 * - Es estructuralmente compatible con `Route` del proyecto.
 * @typedef {Object} VanillaSpaCoreRoute
 * @property {string} id - Identificador único de la ruta.
 * @property {string} path - URL interna asociada a la vista.
 * @property {string} pageTitle - Título de la pestaña.
 * @property {string} headerTitle - Título del header y footer.
 * @property {string} favicon - Favicon de la vista.
 * @property {VanillaSpaCoreRouteComponents} components - Mapa selector/id → URL de componente.
 * @property {VanillaSpaCorePageComponent[]|null} [pagesComponents] - Componentes de la propia página.
 * @property {VanillaSpaCoreRouteStyle[]|null} [styles] - Hojas de estilo de la ruta.
 * @property {VanillaSpaCoreRouteScript[]|null} [scripts] - Scripts de la ruta.
 * @property {unknown[]|null} [libs] - jQuery-only; el motor vanilla lo ignora.
 * @property {VanillaSpaCoreMarkdownShikiEntry[]|null} [MarkdownShikiHtml] - Bloques Shiki de la ruta.
 */



/**
 * --------------------------------------
 * -----  `VanillaSpaCoreRouteManifest`  -----
 * --------------------------------------
 * - Entrada ligera del manifiesto: solo id, path y archivo de ruta.
 * @typedef {Object} VanillaSpaCoreRouteManifest
 * @property {string} id - Identificador único de la ruta.
 * @property {string} path - Path de la URL interna.
 * @property {string} file - Nombre del archivo de ruta sin extensión.
 */



/**
 * ----------------------------------------
 * -----  `VanillaSpaCorePreloadPayload`  -----
 * ----------------------------------------
 * - HTML precargado de una ruta, listo para inyectar de forma síncrona.
 * @typedef {Object} VanillaSpaCorePreloadPayload
 * @property {Array<{el: HTMLElement, fragment: DocumentFragment} | {el: HTMLElement, hide: true}>} components - Componentes del layout.
 * @property {Array<{target: string, fragment: DocumentFragment}>} pageComponents - Componentes de la página.
 * @property {Array<{target: string, fragment: DocumentFragment}>} markdownShiki - Bloques Shiki.
 */
