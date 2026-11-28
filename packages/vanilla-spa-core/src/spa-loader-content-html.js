/*
    *  ---------------------------------------------------------------------------------------------------------  *
    *  -----  spa-loader-content-html.js  --  /packages/vanilla-spa-core/src/spa-loader-content-html.js  -----  *
    *  ---------------------------------------------------------------------------------------------------------  *
*/


//  -----  tipos del motor vanilla  -----
/// <reference path="../types/vanilla-spa-core-options.d.js" />



/**
 * --------------------------------------------------
 * -----  `spaLoaderContentHtml(options = {})`  -----
 * --------------------------------------------------
 * - Motor SPA vanilla: carga HTML dinámicamente y navega con History API.
 * - En esta entrega deja el contrato y la configuración; el routing llega en la tarea siguiente.
 * @param {Partial<VanillaSpaCoreOptions>} [options={}] - Manifiesto, base y carpeta de módulos.
 * @return {void}
 */
export const spaLoaderContentHtml = (options = {}) => {

    /** @type {VanillaSpaCoreOptions} - `configuración final del motor` */
    const settings = {
        routeManifest: [],
        routeModulesBase: '',
        base: '',
        ...options,
    };



    /**
     * -----------------------
     * -----  `init()`  -----
     * -----------------------
     * - Inicializa el motor. En esta tarea solo deja el contrato listo.
     * @return {void}
     */
    const init = () => {

        //  -----  separar el aviso en consola  -----
        console.log('\n');

        //  -----  avisar que el motor vanilla está cargado  -----
        console.warn('-----  vanilla-spa-core cargado  -----');

        //  -----  mostrar cuántas rutas declaró el sitio  -----
        console.log('-----  rutas en el manifiesto:', (settings.routeManifest || []).length, '-----');

        //  -----  separar el aviso en consola  -----
        console.log('\n');

    };



    //  -----  arrancar el motor  -----
    init();

};
