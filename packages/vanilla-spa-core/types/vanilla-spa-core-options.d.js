/*
    *  -----------------------------------------------------------------------------------------------  *
    *  -----  vanilla-spa-core-options.d.js  --  /packages/vanilla-spa-core/types/vanilla-spa-core-options.d.js  -----  *
    *  -----------------------------------------------------------------------------------------------  *
*/


//  -----  tipos de ruta del motor vanilla  -----
/// <reference path="./vanilla-spa-core-route.d.js" />



/**
 * -----------------------------------
 * -----  `VanillaSpaCoreOptions`  -----
 * -----------------------------------
 * - Opciones que el sitio pasa a `spaLoaderContentHtml()` y a `start()`.
 * @typedef {Object} VanillaSpaCoreOptions
 * @property {VanillaSpaCoreRouteManifest[]} [routeManifest] - Manifiesto ligero de rutas para lazy loading.
 * @property {string} [routeModulesBase] - Ruta base para importar dinámicamente los módulos de ruta.
 * @property {string} base - Ruta base de la aplicación.
 */
