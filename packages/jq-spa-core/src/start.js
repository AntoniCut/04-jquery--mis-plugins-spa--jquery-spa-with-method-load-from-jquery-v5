/*
    *  --------------------------------------------------------------  *
    *  -----  start.js  --  /packages/jq-spa-core/src/start.js  -----  *
    *  --------------------------------------------------------------  *
*/



//  -----  tipos de arranque del core  -----
/// <reference path="../../../types/jq-spa-core-start.d.js" />



/**
 * -----------------------
 * -----  `start()`  -----
 * -----------------------
 * - Arranque del motor jQuery + plugin SPA (SPEC 04 paso 3+).
 * @param {JqSpaCoreStartOptions} options - Modo de carga e initSpa del sitio.
 * @return {void}
 */
export const start = (options) => {

    //  -----  validar que el sitio pasó initSpa  -----
    if (typeof options?.initSpa !== 'function') {
        //  -----  lanzar error explícito  -----
        throw new Error('@antonydev/jq-spa-core: start() requiere options.initSpa (función)');
    }

    //  -----  avisar que el stub aún no implementa el flujo completo  -----
    throw new Error(
        `@antonydev/jq-spa-core: start() aún no está implementado (SPEC 04 paso 3). isJQueryModule=${options.isJQueryModule !== false}`
    );

};