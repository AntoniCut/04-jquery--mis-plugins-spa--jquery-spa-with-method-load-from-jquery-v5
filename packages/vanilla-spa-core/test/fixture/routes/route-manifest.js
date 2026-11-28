/*
    *  -----------------------------------------------------------------------------------------  *
    *  -----  route-manifest.js  --  /packages/vanilla-spa-core/test/fixture/routes/route-manifest.js  -----  *
    *  -----------------------------------------------------------------------------------------  *
*/


/**
 * --------------------------------
 * -----  `routeManifest []`  -----
 * --------------------------------
 * - `Rutas del fixture: home, about, slow y 404`.
 * @type {VanillaSpaCoreRouteManifest[]}
 */
export const routeManifest = [

    //  -----  home  -----
    {
        id: 'home',
        path: '',
        file: 'route-home',
    },

    //  -----  about  -----
    {
        id: 'about',
        path: 'about',
        file: 'route-about',
    },

    //  -----  slow: sirve una página con retardo para probar el aborto  -----
    {
        id: 'slow',
        path: 'slow',
        file: 'route-slow',
    },

    //  -----  404  -----
    {
        id: '404NotFoundPage',
        path: '404',
        file: 'route-404',
    },

];
