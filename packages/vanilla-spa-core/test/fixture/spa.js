/*
    *  -------------------------------------------------------------------------------  *
    *  -----  spa.js  --  /packages/vanilla-spa-core/test/fixture/spa.js  -----  *
    *  -------------------------------------------------------------------------------  *
*/


import { spaLoaderContentHtml } from '../../src/start.js';
import { routeManifest } from './routes/route-manifest.js';


/**
 * ---------------------
 * -----  `spa()`  -----
 * ---------------------
 * - Arranca el motor vanilla con el manifiesto y la base del fixture.
 * @return {void}
 */
export const spa = () => {

    //  -----  inicializar el motor con el contrato del proyecto  -----
    spaLoaderContentHtml({
        routeManifest,
        routeModulesBase: '/test/fixture/routes',
        base: '/test/fixture',
    });

};
