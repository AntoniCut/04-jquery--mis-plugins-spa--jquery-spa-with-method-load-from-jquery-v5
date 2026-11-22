/*
    *  -----------------------------------------------------------------------  *
    *  -----  register-gulp.js  --  /packages/spa-build/src/register-gulp.js  -----  *
    *  -----------------------------------------------------------------------  *
*/


//  -----  tipos del config del sitio (raíz del proyecto)  -----
/// <reference path="../../../types/spa-build-config.d.js" />



/**
 * -------------------------------------
 * -----  `registerGulp(options)`  -----
 * -------------------------------------
 * - Punto de entrada del pipeline Gulp (SPEC 03 paso 4).
 * @param {{ projectRoot: string, config: SpaBuildConfig }} options - Raíz del proyecto y spa.config.js.
 * @return {never}
 */
export const registerGulp = (options) => {

    //  -----  construir el mensaje con la raíz del proyecto  -----
    throw new Error(
        `@antonydev/spa-build: registerGulp aún no está implementado (SPEC 03 paso 4). projectRoot=${options.projectRoot}`
    );

};