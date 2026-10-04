/*
    *  -----------------------------------------------------------------------------  *
    *  -----  effect-loading-page.js  --  /src/effects/effect-loading-page.js  -----  *
    *  -----------------------------------------------------------------------------  *
*/


/**
 * -----------------------------------
 * -----  `effectLoadingPage()`  -----
 * -----------------------------------
 * - Muestra el loader hasta la primera ruta y luego lo funde con el layout.
 */
export const effectLoadingPage = () => {

    /** @type {Window & { __spaFirstRouteLoaded?: boolean }} - `ventana con la marca de la primera ruta` */
    const browserWindow = window;

    //  -----  separar el aviso en consola  -----
    console.log('\n');

    //  -----  avisar de que el efecto de carga arranca  -----
    console.warn('-----  effect-loading-page.js  -----');

    //  -----  separar el aviso en consola  -----
    console.log('\n');


    /**
     * -----------------------------------
     * -----  `whenDocumentReady()`  -----
     * -----------------------------------
     * - `Espera a que el documento esté listo`
     * @return {Promise<void>} - Termina cuando el DOM ya se puede consultar.
     */
    const whenDocumentReady = () => {

        //  -----  si el documento ya está listo, no esperar  -----
        if (document.readyState !== 'loading')
            //  -----  resolver de inmediato  -----
            return Promise.resolve();

        //  -----  esperar al DOMContentLoaded  -----
        return new Promise((resolve) => {

            //  -----  resolver cuando el documento termine de cargar  -----
            document.addEventListener('DOMContentLoaded', () => {

                //  -----  resolver la espera del documento  -----
                resolve();

            }, { once: true });

        });

    };



    /**
     * --------------------------------------------
     * -----  `waitForFirstSpaRouteLoaded()`  -----
     * --------------------------------------------
     * - `Espera la primera ruta, un fallo de carga o el tiempo límite`
     * @param {WaitForFirstSpaRouteLoadedOptions} [options={}] - Milisegundos máximos de espera.
     * @return {Promise<void>} - `Termina cuando la primera ruta ya no bloquea el loader`.
     */
    const waitForFirstSpaRouteLoaded = ({ timeoutMs = 6000 } = {}) => {

        //  -----  si la primera ruta ya cargó, no esperar  -----
        if (browserWindow.__spaFirstRouteLoaded)
            //  -----  resolver de inmediato  -----
            return Promise.resolve();

        //  -----  esperar el evento, el error o el tiempo límite  -----
        return new Promise((resolve) => {

            /** - `si la espera ya se resolvió` */
            let settled = false;
            
            /** - `resuelve la espera una sola vez` */
            const resolveOnce = () => {

                //  -----  si ya se resolvió, salir  -----
                if (settled) 
                    //  -----  no resolver otra vez  -----
                    return;

                //  -----  marcar la espera como resuelta  -----
                settled = true;

                //  -----  cancelar el tiempo límite  -----
                clearTimeout(timeoutId);

                //  -----  resolver la promesa  -----
                resolve(undefined);

            };


            /** 
             * ------------------------------------
             * -----  `onFirstRouteLoaded()`  -----
             * ------------------------------------
             * - `oculta el loader cuando la primera ruta carga bien`
             */
            const onFirstRouteLoaded = () => {

                //  -----  resolver la espera  -----
                resolveOnce();
            };



            /**
             * ----------------------------------
             * -----  `onRouteLoadError()`  -----
             * ----------------------------------
             * @param {Event} event - Fallo de la carga inicial de la ruta.
             */
            const onRouteLoadError = (event) => {

                //  -----  escribir el fallo en consola  -----
                console.error('Error en carga inicial de ruta SPA:', event);

                //  -----  resolver la espera para no bloquear el loader  -----
                resolveOnce();
            };


            /** - `identificador del tiempo límite` */
            const timeoutId = setTimeout(() => {

                //  -----  avisar de que se agotó la espera  -----
                console.warn(`Timeout esperando primera ruta SPA (${timeoutMs}ms). Se oculta el loader por fallback.`);

                //  -----  resolver la espera por tiempo límite  -----
                resolveOnce();

            }, timeoutMs);

            //  -----  escuchar la primera ruta cargada  -----
            document.addEventListener('spa:first-route-loaded', onFirstRouteLoaded, { once: true });

            //  -----  escuchar un fallo de carga de ruta  -----
            document.addEventListener('spa:route-load-error', onRouteLoadError, { once: true });

        });

    };



    /**
     * -------------------------
     * -----  `delay(ms)`  -----
     * -------------------------
     * - `Espera los milisegundos indicados`
     * @param {number} ms - Milisegundos de espera.
     * @return {Promise<void>} - `Termina cuando pasa ese tiempo`.
     */
    const delay = (ms) => {

        //  -----  resolver al cumplirse el tiempo  -----
        return new Promise((resolve) => {

            //  -----  programar la resolución  -----
            setTimeout(resolve, ms);
        });

    };



    /**
     * ----------------------------------
     * -----  `runLoadingEffect()`  -----
     * ----------------------------------
     * - `Oculta el loader cuando la primera ruta ya está lista`
     * 
     * `@async`
     * @return {Promise<void>} - `Termina cuando el loader empieza a desaparecer`.
     */
    const runLoadingEffect = async () => {

        //  -----  esperar a que el documento esté listo  -----
        await whenDocumentReady();

        /** @type {HTMLElement | null} - `loader de la página` */
        const loader = /** @type {HTMLElement | null} */ (
            document.querySelector('#loader')
        );

        /** @type {HTMLElement | null} - `layout principal` */
        const layout = /** @type {HTMLElement | null} */ (
            document.querySelector('#layout')
        );

        //  -----  si falta el loader o el layout, salir  -----
        if (!loader || !layout) {

            //  -----  avisar de que el DOM no tiene los nodos  -----
            console.error('Loader o layout no encontrado en el DOM');

            //  -----  no seguir con el efecto  -----
            return;

        }

        //  -----  esperar la primera ruta, un fallo o el tiempo límite  -----
        await waitForFirstSpaRouteLoaded({ timeoutMs: 6000 });

        //  -----  mantener el loader un instante más  -----
        await delay(100);

        //  -----  mostrar el layout con el fundido de entrada  -----
        requestAnimationFrame(() => {

            //  -----  aplicar la clase de fundido al layout  -----
            layout.classList.add('fade-in');

        });

        //  -----  iniciar el fundido de salida del loader  -----
        loader.classList.add('fade-out');

        //  -----  quitar el loader al terminar la transición  -----
        loader.addEventListener('transitionend', () => {

            //  -----  eliminar el loader del DOM  -----
            loader.remove();

        }, { once: true });

    };


    
    //  -----  arrancar el efecto y registrar un fallo  -----
    runLoadingEffect().catch((
        /** @type {unknown} - `fallo del efecto de carga` */
        error
    ) => {

        //  -----  escribir el fallo en consola  -----
        console.error('Error en runLoadingEffect:', error);

    });

};
