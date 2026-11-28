/*
    *  ---------------------------------------------------------------------------------  *
    *  -----  main.js  --  /packages/vanilla-spa-core/test/fixture/main.js  -----  *
    *  ---------------------------------------------------------------------------------  *
*/


import { start } from '../../src/start.js';
import { spa } from './spa.js';


/** @type {Window & { __spaEvents?: Array<Record<string, unknown>>, __viewTransitions?: number }} - `ventana del fixture` */
const browserWindow = window;

//  -----  registro de eventos del motor para la verificación  -----
browserWindow.__spaEvents = [];

//  -----  contador de View Transitions iniciadas  -----
browserWindow.__viewTransitions = 0;


//  -----  capturar la carga de cada ruta  -----
document.addEventListener('spa:route-loaded', (event) => {

    /** @type {CustomEvent} - `evento de ruta cargada` */
    const routeEvent = /** @type {CustomEvent} */ (event);

    //  -----  guardar el evento de ruta cargada  -----
    browserWindow.__spaEvents?.push({ type: 'route-loaded', detail: routeEvent.detail });

});


//  -----  capturar la primera ruta  -----
document.addEventListener('spa:first-route-loaded', () => {

    //  -----  guardar el evento de primera ruta  -----
    browserWindow.__spaEvents?.push({ type: 'first-route-loaded' });

});


//  -----  capturar errores de carga  -----
document.addEventListener('spa:route-load-error', (event) => {

    /** @type {CustomEvent} - `evento de error de carga` */
    const errorEvent = /** @type {CustomEvent} */ (event);

    //  -----  guardar el evento de error  -----
    browserWindow.__spaEvents?.push({ type: 'route-load-error', detail: errorEvent.detail });

});


/** @type {((callback: () => void | Promise<void>) => ViewTransition)|undefined} - `startViewTransition original del navegador` */
const originalStartViewTransition = document.startViewTransition?.bind(document);

//  -----  contar las View Transitions sin cambiar su comportamiento  -----
if (originalStartViewTransition) {

    /** - `implementación nativa sin undefined` */
    const nativeStartViewTransition = originalStartViewTransition;

    /**
     * ------------------------------------------------
     * -----  `startViewTransition(callback)`  -----
     * ------------------------------------------------
     * @param {() => void | Promise<void>} callback - Mutación del DOM.
     * @return {ViewTransition} - Transición nativa.
     */
    const startViewTransition = (callback) => {

        //  -----  sumar una transición iniciada  -----
        browserWindow.__viewTransitions = (browserWindow.__viewTransitions || 0) + 1;

        //  -----  delegar en la implementación nativa  -----
        return nativeStartViewTransition(callback);

    };

    //  -----  reemplazar la API nativa por la versión contada  -----
    document.startViewTransition = startViewTransition;

}


//  -----  arrancar el motor vanilla con la SPA del fixture  -----
start({ initSpa: spa });
