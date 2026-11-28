/*
    *  -------------------------------------------------------------------  *
    *  -----  start.js  --  /packages/vanilla-spa-core/src/start.js  -----  *
    *  -------------------------------------------------------------------  *
*/


//  -----  tipos de arranque del motor vanilla  -----
/// <reference path="../types/vanilla-spa-core-start.d.js" />

//  -----  motor vanilla  -----
import { spaLoaderContentHtml } from './spa-loader-content-html.js';


export { spaLoaderContentHtml };



/**
 * -----------------------
 * -----  `start()`  -----
 * -----------------------
 * - Punto de entrada del paquete.
 * - Si el sitio pasa `initSpa`, lo invoca; si no, inicializa el motor con las opciones.
 * @param {VanillaSpaCoreStartOptions} [options={}] - Callback del sitio u opciones del motor.
 * @return {void}
 */
export const start = (options = {}) => {

    //  -----  si el sitio pasa initSpa, arrancar su SPA  -----
    if (typeof options.initSpa === 'function') {

        //  -----  invocar el callback del sitio  -----
        options.initSpa();

        //  -----  salir sin inicializar el motor dos veces  -----
        return;
    }

    //  -----  inicializar el motor con las opciones recibidas  -----
    spaLoaderContentHtml(options);

};
