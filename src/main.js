/*
    *  ----------------------------------------  *
    *  -----  /main.js  --  /src/main.js  -----  *
    *  ----------------------------------------  *
*/


import { effectLoadingPage } from './effects/effect-loading-page.js';
import { fallbackJQueryJQueryUI } from './libs/jquery/loaders/fallback-jquery-jquery-ui.js'
import { loadJQueryCoreByImport } from './libs/jquery-module/loader/load-jquery-by-import.js'
import { preloadAllJQueryUI } from './libs/jquery-module/loader/load-jquery-ui-by-import.js';
import { spaWithMethodLoadFromJQueryPlugins } from './plugins/spa-with-method-load-from-jquery/v5/jquery.spa-with-method-load-from-jquery.js';
import { spa } from './spa/spa.js';
import { base } from './routes/paths.js';


//  -----  Efecto de Loading de la Página (solo en navegador)  -----
effectLoadingPage();


//  -----  Re-export de `base` para mantener compatibilidad con imports externos  -----
export { base };


/** 
 *  - `Tipo de carga de jQuery (module o classic) - true: module, false: classic -----` 
 * @type {boolean}
 */
const isJQueryModule = true;



/**
 * ----------------------------------
 * -----  `loadJQueryClassic()` -----
 * ----------------------------------
 *  - Carga jQuery y jQuery UI usando fallback CDN → local  -----
 *  - Inicia el plugin que carga la SPA  -----
 *  - Inicia la SPA específica del sitio  -----
 *  - Limpiar la consola para produccion  -----
 */

const loadJQueryClassic = () => {

    fallbackJQueryJQueryUI()

        .then(() => {

            console.log('\n');
            console.warn("----- jQuery y jQuery UI cargados correctamente -----");
            console.log('\n');

            //  -----  Iniciar el plugin que carga la SPA  -----
            spaWithMethodLoadFromJQueryPlugins();

            //  -----  Iniciar la SPA específica del sitio  -----
            spa();

            //  -----  Limpiar la consola para produccion  -----
            //console.clear();

        })

        .catch(err => {
            console.log('\n');
            console.error("Error cargando jQuery / jQuery UI:", err);
            console.log('\n');
        });


}



/**
 * ---------------------------------
 * -----  `loadJQueryModule()` -----
 * ---------------------------------
 *  - Carga jQuery core desde imports  -----
 *  - Inicia el plugin que carga la SPA  -----
 *  - Inicia la SPA específica del sitio  -----
 *  - Pre-cargar jQuery UI en background una vez que la página esté completamente cargada  -----
 *  - Limpiar la consola para produccion  -----
 */

const loadJQueryModule = () => {

    //  -----  Si no hay window, no se carga jQuery module  -----
    if (typeof window === 'undefined')
        return;


    loadJQueryCoreByImport()

        .then(() => {

            console.log('\n');
            console.warn("----- jQuery core cargado correctamente desde imports -----");
            console.log("-----  jQuery UI se cargará en background tras window load  -----");
            console.log('\n');

            //  -----  version de jQuery confirmada en consola  -----
            console.log('\n');
            console.log('Versión de jQuery cargada:', $.fn.jquery);
            console.log('\n');

            //  -----  Iniciar el plugin que carga la SPA  -----
            spaWithMethodLoadFromJQueryPlugins();

            //  -----  Iniciar la SPA específica del sitio  -----
            spa();

            //  -----  Pre-cargar jQuery UI en background una vez que la página esté completamente cargada  -----
            window.addEventListener('load', () => {

                preloadAllJQueryUI()
                    .then(() => {
                        console.log('\n');
                        console.warn('-----  Todos los módulos de jQuery UI pre-cargados en background  -----');
                        console.log('\n');
                    })
                    .catch(err => {
                        console.error('Error pre-cargando jQuery UI:', err);
                    });

            });

            //  -----  Limpiar la consola para produccion  -----
            //console.clear();

        })

        .catch(err => {
            console.log('\n');
            console.error("Error cargando jQuery core desde imports:", err);
            console.log('\n');
        });

}



//  -----  Cargar jQuery (module o classic) -----
isJQueryModule ? loadJQueryModule() : loadJQueryClassic();
