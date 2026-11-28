/*
    *  -----------------------------------------------------------------------------------------------  *
    *  -----  vanilla-spa-core-start.d.js  --  /packages/vanilla-spa-core/types/vanilla-spa-core-start.d.js  -----  *
    *  -----------------------------------------------------------------------------------------------  *
*/


//  -----  tipos de opciones del motor vanilla  -----
/// <reference path="./vanilla-spa-core-options.d.js" />



/**
 * ----------------------------------------
 * -----  `VanillaSpaCoreStartOptions`  -----
 * ----------------------------------------
 * - Opciones de `start()`.
 * - Si llega `initSpa`, el sitio arranca su SPA.
 * - Si no, las opciones se pasan a `spaLoaderContentHtml()`.
 * @typedef {Object} VanillaSpaCoreStartOptions
 * @property {() => void} [initSpa] - Callback del sitio que arranca la SPA.
 * @property {VanillaSpaCoreRouteManifest[]} [routeManifest] - Manifiesto ligero de rutas.
 * @property {string} [routeModulesBase] - Ruta base de los módulos de ruta.
 * @property {string} [base] - Ruta base de la aplicación.
 */
