/*
    *  -------------------------------------------------------------------------------  *
    *  -----  route-preload-payload.d.js  --  /types/route-preload-payload.d.js  -----  *
    *  -------------------------------------------------------------------------------  *
*/


/**
 * --------------------------------
 * -----  `RoutePreloadPayload`  -----
 * --------------------------------
 * @typedef {Object} RoutePreloadPayload - Contenido HTML precargado por `preloadRouteContent` (FASE 1), listo para inyectar de forma síncrona en `applyPreloadedContent` (FASE 2).
 * @property {Array<{selector: string, hide: true} | {selector: string, url: string, html: string, hide?: false}>} components - HTML de las regiones del layout.
 * @property {Array<{target: string, url: string, html: string}>} pagesComponents - HTML de los componentes de la propia página.
 * @property {Array<{target: string, url: string, html: string}>} markdownShikiHtml - HTML resaltado con Shiki.
 */
