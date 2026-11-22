/*
    *  --------------------------------------------------------------  *
    *  -----  start.js  --  /packages/jq-spa-core/src/start.js  -----  *
    *  --------------------------------------------------------------  *
*/



//  -----  tipos de arranque del core  -----
/// <reference path="../../../types/jq-spa-core-start.d.js" />

//  -----  globals jQuery tras los loaders  -----
/// <reference path="./libs/jquery/jquery-global.d.ts" />


//  -----  fallback CDN → local para jQuery clásico  -----
import { fallbackJQueryJQueryUI } from './libs/jquery/loaders/fallback-jquery-jquery-ui.js';

//  -----  carga ESM de jQuery core  -----
import { loadJQueryCoreByImport } from './libs/jquery-module/loader/load-jquery-by-import.js';

//  -----  precarga en background de widgets jQuery UI  -----
import { preloadAllJQueryUI } from './libs/jquery-module/loader/load-jquery-ui-by-import.js';

//  -----  registro del plugin SPA v5  -----
import { spaWithMethodLoadFromJQueryPlugins } from './plugins/spa-with-method-load-from-jquery/v5/jquery.spa-with-method-load-from-jquery.js';



/**
 * -------------------------------------
 * -----  `loadJQueryClassic()`  -----
 * -------------------------------------
 * - Carga jQuery y jQuery UI usando fallback CDN → local.
 * - Registra el plugin SPA y ejecuta initSpa del sitio.
 * @param {() => void} initSpa - Callback del proyecto que arranca spa.js.
 * @return {void}
 */
const loadJQueryClassic = (initSpa) => {

    //  -----  iniciar la cadena fallback CDN → local  -----
    fallbackJQueryJQueryUI()

        .then(() => {

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  confirmar carga correcta  -----
            console.warn('----- jQuery y jQuery UI cargados correctamente -----');

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  registrar el plugin SPA v5  -----
            spaWithMethodLoadFromJQueryPlugins();

            //  -----  arrancar la SPA del sitio  -----
            initSpa();

            //  -----  limpiar la consola en producción (opcional)  -----
            //console.clear();

        })

        .catch((err) => {

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  reportar error de carga  -----
            console.error('Error cargando jQuery / jQuery UI:', err);

            //  -----  separador visual en consola  -----
            console.log('\n');

        });

};



/**
 * ------------------------------------
 * -----  `loadJQueryModule()`  -----
 * ------------------------------------
 * - Carga jQuery core por import; UI en background tras window load.
 * - Registra el plugin SPA y ejecuta initSpa del sitio.
 * @param {() => void} initSpa - Callback del proyecto que arranca spa.js.
 * @return {void}
 */
const loadJQueryModule = (initSpa) => {

    //  -----  en entornos sin window no hay arranque de navegador  -----
    if (typeof window === 'undefined')
        //  -----  salir sin ejecutar el flujo de módulo  -----
        return;


    //  -----  cargar jQuery core vía ESM  -----
    loadJQueryCoreByImport()

        .then(() => {

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  confirmar carga del core  -----
            console.warn('----- jQuery core cargado correctamente desde imports -----');

            //  -----  avisar que UI va en background  -----
            console.log('-----  jQuery UI se cargará en background tras window load  -----');

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  versión de jQuery en consola  -----
            console.log('\n');

            //  -----  leer versión desde el global expuesto por el loader  -----
            console.log('Versión de jQuery cargada:', window.jQuery.fn.jquery);

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  registrar el plugin SPA v5  -----
            spaWithMethodLoadFromJQueryPlugins();

            //  -----  arrancar la SPA del sitio  -----
            initSpa();

            //  -----  precargar jQuery UI cuando el documento terminó de cargar  -----
            window.addEventListener('load', () => {

                //  -----  importar todos los módulos UI configurados  -----
                preloadAllJQueryUI()
                    .then(() => {

                        //  -----  separador visual en consola  -----
                        console.log('\n');

                        //  -----  confirmar precarga de UI  -----
                        console.warn('-----  Todos los módulos de jQuery UI pre-cargados en background  -----');

                        //  -----  separador visual en consola  -----
                        console.log('\n');

                    })
                    .catch((err) => {

                        //  -----  reportar fallo de precarga  -----
                        console.error('Error pre-cargando jQuery UI:', err);

                    });

            });

            //  -----  limpiar la consola en producción (opcional)  -----
            //console.clear();

        })

        .catch((err) => {

            //  -----  separador visual en consola  -----
            console.log('\n');

            //  -----  reportar error de carga del core  -----
            console.error('Error cargando jQuery core desde imports:', err);

            //  -----  separador visual en consola  -----
            console.log('\n');

        });

};



/**
 * -----------------------
 * -----  `start()`  -----
 * -----------------------
 * - Punto de entrada del core: carga jQuery, registra el plugin e invoca initSpa.
 * @param {JqSpaCoreStartOptions} options - Modo ESM o classic y callback del sitio.
 * @return {void}
 */
export const start = (options) => {

    //  -----  validar que el sitio pasó initSpa  -----
    if (typeof options?.initSpa !== 'function') {
        //  -----  lanzar error explícito  -----
        throw new Error('@antonydev/jq-spa-core: start() requiere options.initSpa (función)');
    }

    /** - `true: módulo ESM; false: fallback CDN clásico` */
    const isJQueryModule = options.isJQueryModule !== false;

    //  -----  elegir flujo de carga según el modo  -----
    if (isJQueryModule) {
        //  -----  arranque con imports ESM  -----
        loadJQueryModule(options.initSpa);
    }
    else {
        //  -----  arranque con fallback CDN → local  -----
        loadJQueryClassic(options.initSpa);
    }

};