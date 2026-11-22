/*
    *  ---------------------------------------------------------------------  *
    *  -----  register-gulp.js  --  /packages/spa-build/src/register-gulp.js  -----  *
    *  ---------------------------------------------------------------------  *
*/



//  -----  factoría de tareas gulp  -----
import { createGulpTasks } from './create-gulp-tasks.js';


//  -----  tipos del config del sitio  -----
/// <reference path="../../../types/spa-build-config.d.js" />



/**
 * --------------------------------
 * -----  `registerGulp()`  -----
 * --------------------------------
 * - Expone las tareas Gulp del sitio para el gulpfile.js de la raíz.
 * @param {{ projectRoot: string, config: SpaBuildConfig }} options - Raíz del proyecto y spa.config.js.
 * @return {ReturnType<typeof createGulpTasks>} - `Mapa de tareas con el mismo contrato que el antiguo gulpfile`.
 */
export const registerGulp = (options) => {

    //  -----  crear las tareas según el config del proyecto  -----
    return createGulpTasks(options);

};