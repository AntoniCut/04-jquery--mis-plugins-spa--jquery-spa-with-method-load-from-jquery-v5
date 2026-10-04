/*
    *  ------------------------------------------  *
    *  -----  /spa.js  --  /src/spa/spa.js  -----  *
    *  ------------------------------------------  *
*/


import { base } from '../routes/paths.js';
import { routeManifest } from '../routes/route-manifest.js';
import { loadJQueryUILib } from '../libs/jquery-module/loader/load-jquery-ui-by-import.js';



/**
 *  -------------------
 *  ----- `spa()` -----
 *  -------------------
 * 
 * - Inicializa la lógica SPA usando jQuery.
 * - Configura las rutas del proyecto y las pasa al plugin dinámico
 *   `spaWithMethodLoadFromJQuery`.
 * - Se encarga únicamente de:
 *   -   ✔ cargar las rutas    
 *   -   ✔ pasar la configuración al plugin
 *   -   ✔ inicializar la SPA
 */
export const spa = () => {

    
    //  -----  avisar que se ha cargado el archivo spa.js  -----
    console.log('\n');
    console.warn('-----  spa.js cargado  -----');
    console.log('\n');


    /** 
     * ---------------------
     * ----- `$layout` -----
     * ---------------------
     * - `Contenedor raíz de la SPA`
     * @type {JQuery<HTMLDivElement>}
     */
    const $layout = $('#layout');


    /** 
     * -----------------------------------
     * -----  `ConfigOptionsSPA` {}  -----
     * -----------------------------------
     * - `Opciones de configuración para la SPA`
     * @type {ConfigOptionsSPA} - `Opciones de configuración para la SPA`
     */
    const optionsPluginsSPA = {
        routeManifest,
        routeModulesBase: `${base}/app/routes`,
        base,
        draggable: true,
        libLoader: loadJQueryUILib,
    };

    //  ----------  Invocamos el Plugins  --  jquery.spa-with-method-load-from-jquery.js - v4  ----------
    $layout.spaWithMethodLoadFromJQuery(optionsPluginsSPA);


};
