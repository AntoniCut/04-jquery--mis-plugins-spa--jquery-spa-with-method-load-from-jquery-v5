/*
    *  ------------------------------------------------------------------------------  *
    *  -----  /effect-loading-page.js  --  /src/scripts/effect-loading-page.js  -----  *
    *  ------------------------------------------------------------------------------  *
*/

/** @typedef {import('../../types/index.js').WaitForFirstSpaRouteLoadedOptions} WaitForFirstSpaRouteLoadedOptions */

/**
 * -----------------------------------
 * -----  `effectLoadingPage()`  -----
 * -----------------------------------
 * 
 * - Implementa un efecto de carga para la página web.
 * - Muestra un loader mientras se carga el contenido principal.
 * - Aplica transiciones suaves entre el loader y el contenido principal.
 * 
 */

export const effectLoadingPage = () => {

    /** @type {Window & { __spaFirstRouteLoaded?: boolean }} */
    const browserWindow = window;


    console.log('\n')
    console.warn('-----  effect-loading-page.js  -----');
    console.log('\n');


    const whenDocumentReady = () => {
        if (document.readyState !== 'loading') {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
    };


    /**
     * ---------------------------------------------------------------------
     * -----  `waitForFirstSpaRouteLoaded({ timeoutMs = 6000 } = {})`  -----
     * ---------------------------------------------------------------------
     *
     * - Escucha `spa:first-route-loaded` (éxito) y `spa:route-load-error` (error).
     * - Aplica timeout de fallback para no dejar el loader bloqueado.
     *
     * @param {WaitForFirstSpaRouteLoadedOptions} [options={}]
     * @returns {Promise<void>}
     */
    const waitForFirstSpaRouteLoaded = ({ timeoutMs = 6000 } = {}) => {
        if (browserWindow.__spaFirstRouteLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {

            let settled = false;

            const resolveOnce = () => {
                if (settled)
                    return;
                settled = true;
                clearTimeout(timeoutId);
                resolve(undefined);
            };

            const onFirstRouteLoaded = () => {
                resolveOnce();
            };

            const onRouteLoadError = (event) => {
                console.error('Error en carga inicial de ruta SPA:', event);
                resolveOnce();
            };

            const timeoutId = setTimeout(() => {
                console.warn(`Timeout esperando primera ruta SPA (${timeoutMs}ms). Se oculta el loader por fallback.`);
                resolveOnce();
            }, timeoutMs);

            document.addEventListener('spa:first-route-loaded', onFirstRouteLoaded, { once: true });
            document.addEventListener('spa:route-load-error', onRouteLoadError, { once: true });
        });
    };


    /** @param {number} ms */
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


    const runLoadingEffect = async () => {

        await whenDocumentReady();

        /** @type {HTMLElement | null} */
        const loader = document.querySelector('#loader');

        /** @type {HTMLElement | null} */
        const layout = document.querySelector('#layout');

        if (!loader || !layout) {
            console.error('Loader o layout no encontrado en el DOM');
            return;
        }

        // Espera la primera carga completa de componentes SPA (ok, error o timeout).
        await waitForFirstSpaRouteLoaded({ timeoutMs: 6000 });

        // Mantiene el loader 100ms adicionales antes de mostrar la web.
        await delay(100);

        requestAnimationFrame(() => layout.classList.add('fade-in'));

        loader.classList.add('fade-out');

        loader.addEventListener('transitionend', () => {
            loader.remove();
        }, { once: true });

    };

    runLoadingEffect().catch((error) => {
        console.error('Error en runLoadingEffect:', error);
    });

}
