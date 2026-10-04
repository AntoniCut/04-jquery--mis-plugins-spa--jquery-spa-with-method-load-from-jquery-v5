/*
    *  ----------------------------------------------------------------------------------------------------------------------------------------------------------  *
    *  -----  /jquery.spa-with-method-load-from-jquery.js  --  /src/plugins/spa-with-method-load-from-jquery/v4/jquery.spa-with-method-load-from-jquery.js  -----  *
    *  ----------------------------------------------------------------------------------------------------------------------------------------------------------  *
*/


/**
 *  ----------------------------------------------------
 *  -----  `spaWithMethodLoadFromJQueryPlugins()`  -----
 *  ----------------------------------------------------
 * 
 * @version `5.0.0`
 * 
 * @author `Antonio Francisco Cutillas García`
 * 
 * @description
 *  - Este plugin `spaWithMethodLoadFromJQueryPlugins` permite cargar contenido dinámico
 *    en una aplicación SPA utilizando el método `load` de jQuery.
 *  - Envuelve el plugin en una función de `Módulos ES6` para facilitar su integración.
 * 
 * - `Añadimos`:
 *     - Efecto Loading para la carga inicial de la página.
 *     - 404NotFoundPage: Ruta para manejar páginas no encontradas.
 *     - Normalización de rutas y pathname para evitar problemas con slashes y base.
 *     - Notificación de carga de ruta mediante eventos personalizados (`spa:route-loaded`, `spa:first-route-loaded`, `spa:route-load-error`).
 *     - Manejo de errores en la carga de componentes y rutas.
 *     - Soporte para scripts clásicos y módulos ES6 (type="module").
 *     - Reescritura de URLs en HTML inyectado para evitar roturas en la SPA.
 *     - Funciones auxiliares para manejo de rutas, módulos y metadatos.
 */
export const spaWithMethodLoadFromJQueryPlugins = () => {


    /*
        *  ---------------------------------------------------------------------------  *
        *  -----  Función Anónima Autoejecutable que Encapsula el plugin jQuery  -----  *
        *  ---------------------------------------------------------------------------  *
    */
   
            
    (($) => {


        /**
         * ------------------------------------------------
         * -----  `$.fn.spaWithMethodLoadFromJQuery`  -----
         * ------------------------------------------------
         * - Plugin SPA que añade funcionalidad al prototipo de jQuery.
         * @param {ConfigOptionsSPA} options - `Opciones de configuración de la SPA`
         * @returns {JQuery} - `Retorna el objeto jQuery para encadenamiento`
         */
        $.fn.spaWithMethodLoadFromJQuery = function (options) {


            /*
                *  -------------------------------------------------------------------------  *
                *  -----  Configuración por defecto (solo lo estrictamente necesario)  -----  *
                *  -------------------------------------------------------------------------  *
            */


            /**
             * ----------------------------------
             * -----  `defaultSettings {}`  -----
             * ----------------------------------
             * - Valores por defecto del plugin SPA.
             * @type {ConfigOptionsSPA}
             */
            const defaultSettings = {
                
                /** @type {RouteManifest[]} */
                routeManifest: [],
                
                routeModulesBase: '',
                base: '',
                draggable: false,
                
                /** @type {((name: string) => Promise<void>)|null} */
                libLoader: null,
            };


            /**
             * ---------------------------
             * -----  `settings {}`  -----
             * ---------------------------
             * - Combina `defaultSettings` con las opciones del usuario (`options`).
             * @type {ConfigOptionsSPA} - `Objeto de configuración final del plugin SPA`
             */
            const settings = $.extend(
                {},
                defaultSettings,
                options
            );



            /*
                *  ----------------------------------------------------------------------------  *
                *  -----  Caché de rutas importadas, módulos rotos y token de navegación  -----  *
                *  ----------------------------------------------------------------------------  *
            */

            
            /** @type {Map<string, Route>} - `Cache de módulos de ruta cargados con import()` */
            const routeCache = new Map();

            /** @type {Set<string>} - `Registro de módulos de ruta cuyo import() falló, para evitar reintentos repetidos sobre rutas rotas` */
            const brokenRouteModules = new Set();


            /** @type {number} - `Token incremental de la navegación en curso, usado para descartar respuestas obsoletas` */
            let navigationToken = 0;


            /*
                *  ---------------------------------------------------------  *
                *  -----  Normalización de rutas, pathnames y slashes  -----  *
                *  ---------------------------------------------------------  *
            */


            /**
             * ------------------------------------------------------
             * -----  `collapsePathnameSlashes(pathname = '')`  -----
             * ------------------------------------------------------
             * - Colapsa barras duplicadas en un pathname del navegador.
             * - Evita valores como `//mis-plugins-spa/...` que history API
             *   interpreta como URL protocol-relative (origen distinto → SecurityError).
             * @param {string} pathname - Pathname crudo
             * @returns {string} - `Pathname con una sola barra inicial`
             */
            const collapsePathnameSlashes = (pathname = '') => {

                /** - `Pathname con las barras duplicadas colapsadas` */
                let pathnameCollapsed = String(pathname || '');

                //  -----  si el pathname está vacío  -----
                if (!pathnameCollapsed)
                    //  -----  devolver la raíz  -----
                    return '/';

                //  -----  colapsar las barras duplicadas  -----
                pathnameCollapsed = pathnameCollapsed.replace(/\/+/g, '/');

                //  -----  si no empieza por barra, añadirla  -----
                if (!pathnameCollapsed.startsWith('/'))
                    //  -----  anteponer la barra inicial  -----
                    pathnameCollapsed = `/${pathnameCollapsed}`;

                //  -----  devolver el pathname normalizado  -----
                return pathnameCollapsed;

            };


            /**
             * ---------------------------------------------------
             * -----  `safeHistoryPathname(pathname = '')`  -----
             * ---------------------------------------------------
             * - Pathname seguro para history.pushState/replaceState (misma origin).
             * @param {string} pathname - Pathname crudo o relativo
             * @returns {string} - `Pathname absoluto normalizado`
             */
            const safeHistoryPathname = (pathname = '') => {

                //  -----  resolver el pathname contra el origen actual  -----
                try {

                    //  -----  devolver el pathname absoluto  -----
                    return new URL(collapsePathnameSlashes(pathname), location.origin).pathname;

                //  -----  si la url no es válida, colapsar las barras  -----
                } catch (e) {

                    //  -----  devolver el pathname colapsado  -----
                    return collapsePathnameSlashes(pathname);

                }

            };


            /**
             * -----------------------------------
             * -----  `normalize(raw = '')`  -----
             * -----------------------------------
             * - Normaliza una ruta (quita base y slashes de inicio/fin)
             * @param {string} raw - `Ruta sin procesar, posiblemente con base y slashes`
             * @returns {string} - `Ruta normalizada`
             */
            const normalize = (raw = '') => {

                /** @type {string} - `Base de la aplicación` */
                const base = settings.base || '';

                /** @type {string} - `Ruta en proceso de normalización` */
                let normalizedPath = String(raw || '');

                //  -----  colapsar slashes duplicados en pathnames absolutos del navegador  -----
                if (normalizedPath.startsWith('/'))
                    
                    //  -----  sustituir el pathname por su versión colapsada  -----
                    normalizedPath = collapsePathnameSlashes(normalizedPath);

                //  -----  quitar base si está presente (también con base/path colapsados)  -----
                if (base) {

                    /** - `Base de la aplicación sin barra final` */
                    const normalizedBase = collapsePathnameSlashes(base).replace(/\/$/, '');

                    //  -----  quitar la base ya colapsada  -----
                    if (normalizedBase && normalizedPath.startsWith(normalizedBase))
                        
                        //  -----  recortar esa base del pathname  -----
                        normalizedPath = normalizedPath.slice(normalizedBase.length);
                    
                    //  -----  si la base aparece tal cual, quitarla  -----
                    else if (normalizedPath.startsWith(base))
                        
                        //  -----  recortar la base original del pathname  -----
                        normalizedPath = normalizedPath.slice(base.length);

                }

                //  -----  quitar leading/trailing slash  -----
                normalizedPath = normalizedPath.replace(/^\/|\/$/g, '');

                //  -----  devolver la ruta normalizada  -----
                return normalizedPath;

            }



            /**
             * ---------------------------------------------
             * -----  `buildPathname(routePath = '')`  -----
             * ---------------------------------------------
             * - Construye pathname absoluto para pushState, normalizado con base
             * @param {string} routePath - `Ruta relativa de la ruta`
             * @returns {string} - `Pathname absoluto y normalizado`
             */
            const buildPathname = (routePath = '') => {

                /** @type {string} - `Base de la aplicación` */
                const base = (settings.base || '').replace(/\/$/, '');

                /** @type {string} - `Ruta normalizada (con leading slash)` */
                const trimmed = routePath ? `/${String(routePath).replace(/^\/|\/$/g, '')}` : '';

                /** - `Base absoluta, con barra inicial` */
                const absoluteBase = base.startsWith('/') ? base : `/${base}`;

                //  -----  construir el pathname absoluto  -----
                try {

                    //  -----  devolver el pathname seguro para history  -----
                    return safeHistoryPathname(new URL(absoluteBase + trimmed, location.origin).pathname);
                } 
                
                //  -----  si la url falla, usar el fallback  -----
                catch (e) {

                    //  -----  fallback básico  -----
                    return safeHistoryPathname(absoluteBase + trimmed);
                }

            };



            /**
             * ---------------------------------------------------------
             * -----  `findManifestEntryByPath(rawPathname = '')`  -----
             * ---------------------------------------------------------
             * - Busca una entrada del manifiesto por pathname normalizado.
             * @param {string} rawPathname - `pathname crudo desde la URL o history state`
             * @returns {RouteManifest|undefined} - `Entrada del manifiesto o undefined`
             */
            const findManifestEntryByPath = (rawPathname = '') => {

                /** @type {string} - `Ruta normalizada para buscar en settings.routeManifest` */
                const normalized = normalize(rawPathname);

                //  -----  devolver la entrada del manifiesto que coincide con la ruta  -----
                return (settings.routeManifest || []).find(entry => normalize(entry.path) === normalized);

            };


            /**
             * ----------------------------------------------
             * -----  `findManifestEntryById(routeId)`  -----
             * ----------------------------------------------
             * - Busca una entrada del manifiesto por id.
             * @param {string} routeId - `Id de la ruta a buscar`
             * @returns {RouteManifest|undefined} - `Entrada del manifiesto o undefined`
             */
            const findManifestEntryById = (routeId) => {

                //  -----  devolver la entrada del manifiesto con ese id  -----
                return (settings.routeManifest || []).find(entry => entry.id === routeId);

            };


            /**
             * ----------------------------------------
             * -----  `loadRouteModule(file)`  -----
             * ----------------------------------------
             * - Importa dinámicamente un módulo de ruta y lo cachea.
             * @async
             * @param {string} file - `Nombre del archivo de ruta sin extensión`
             * @returns {Promise<Route|undefined>} - `Ruta importada o undefined`
             */
            const loadRouteModule = async (file) => {

                //  -----  si el módulo ya está en caché, reutilizarlo  -----
                if (routeCache.has(file))
                    //  -----  devolver el módulo cacheado  -----
                    return routeCache.get(file);

                //  -----  Si el módulo ya falló anteriormente, no reintentar el import() para evitar ciclos de error repetidos  -----
                if (brokenRouteModules.has(file)) {
                    //  -----  avisar de que el módulo roto no se reimporta  -----
                    console.warn(`⚠️ Módulo de ruta previamente roto, se omite reimport: ${file}`);
                    //  -----  salir sin volver a importar el módulo roto  -----
                    return undefined;
                }

                //  -----  importar el módulo de ruta  -----
                try {

                    /** @type {string} - `URL del módulo de ruta` */
                    const moduleUrl = `${settings.routeModulesBase}/${file}.js`;

                    /** @type {Record<string, unknown>} - `Módulo ESM importado` */
                    const mod = await import(moduleUrl);

                    /** @type {Route|undefined} - `Primer export del módulo` */
                    const route = /** @type {Route|undefined} */ (Object.values(mod)[0]);

                    //  -----  si el módulo exporta una ruta, guardarla  -----
                    if (route)
                        //  -----  guardar la ruta en la caché  -----
                        routeCache.set(file, route);

                    //  -----  devolver la ruta importada  -----
                    return route;

                } 
                

                //  -----  si el import falla, marcar el módulo como roto  -----
                catch (error) {

                    //  -----  registrar el error de importación  -----
                    console.error(`Error importando modulo de ruta: ${file}`, error);

                    //  -----  Registrar el módulo como roto para no reintentar import() en futuras navegaciones  -----
                    brokenRouteModules.add(file);

                    //  -----  devolver undefined  -----
                    return undefined;
                }

            };


            /**
             * -----------------------------------
             * -----  `findNotFoundRoute()`  -----
             * -----------------------------------
             * - Obtiene la entrada 404 desde el manifiesto.
             * @returns {RouteManifest|undefined} - `Entrada 404 o undefined`
             */
            const findNotFoundRoute = () => {

                //  -----  devolver la entrada 404 del manifiesto  -----
                return (settings.routeManifest || []).find(entry =>
                    entry?.id === '404NotFoundPage' ||
                    normalize(entry?.path) === '404' ||
                    normalize(entry?.path) === '404-not-found' ||
                    /404/i.test(String(entry?.id || ''))
                );

            };



            /**
             * ----------------------------------------------------------
             * -----  `notifyRouteLoadError(route, error, source)`  -----
             * ----------------------------------------------------------
             * - Notifica un error durante la carga de ruta.
             * - Emite `spa:route-load-error` con detalles del fallo.
             * - Si ocurre en la carga inicial, desbloquea el loader con fallback seguro.
             * @param {Route|undefined} route - `Ruta que falló al cargar, o undefined si no llegó a resolverse`
             * @param {unknown} error - `Fallo de la carga: se escribe en consola y en el mensaje del evento`
             * @param {'init'|'click'|'popstate'} source - `Quién disparó la navegación: init, click o popstate`
             */
            const notifyRouteLoadError = (route, error, source) => {

                //  -----  registrar el error de carga en consola  -----
                console.error('Error cargando ruta SPA:', error);

                //  -----  emitir el evento spa:route-load-error  -----
                document.dispatchEvent(
                    
                    new CustomEvent('spa:route-load-error', {
                        detail: {
                            id: route?.id || null,
                            path: route?.path || window.location.pathname,
                            source,
                            message: error instanceof Error ? error.message : String(error || 'Error desconocido')
                        }
                    })
                );

                //  -----  si aún no se ha completado la primera carga  -----
                if (!window.__spaFirstRouteLoaded) {
                    
                    //  -----  marcar la primera carga como hecha  -----
                    window.__spaFirstRouteLoaded = true;
                    
                    //  -----  emitir spa:first-route-loaded para soltar el loader  -----
                    document.dispatchEvent(new CustomEvent('spa:first-route-loaded'));
                }

            };



            /**
             * -----------------------------------------
             * -----  `loadNotFoundRoute(source)`  -----
             * -----------------------------------------
             * - Carga la ruta 404 si existe.
             * @async
             * @param {'init'|'click'|'popstate'} source - `Origen de la navegación`
             * @returns {Promise<Route|undefined>} - `Ruta 404 cargada o undefined`
             */
            const loadNotFoundRoute = async (source) => {

                /** @type {RouteManifest|undefined} - `Entrada 404` */
                const entry404 = findNotFoundRoute();

                //  -----  si no hay ruta 404 configurada, avisar y salir  -----
                if (!entry404) {
                    
                    //  -----  registrar que falta la ruta 404  -----
                    console.error(`No existe ruta 404 configurada (source: ${source}).`);
                    
                    //  -----  notificar el fallo de la ruta 404  -----
                    notifyRouteLoadError(undefined, new Error('No existe ruta 404 configurada.'), source);
                    
                    //  -----  devolver undefined  -----
                    return undefined;
                }

                /** @type {Route|undefined} - `Ruta 404 importada dinámicamente` */
                const route404 = await loadRouteModule(entry404.file);

                //  -----  si no se pudo importar la ruta 404, avisar y salir  -----
                if (!route404) {
                    
                    //  -----  registrar el fallo al importar la 404  -----
                    console.error(`No se pudo importar la ruta 404 (source: ${source}).`);
                    
                    //  -----  notificar el fallo de importación  -----
                    notifyRouteLoadError(undefined, new Error('No se pudo importar la ruta 404.'), source);
                    
                    //  -----  devolver undefined  -----
                    return undefined;
                }


                //  -----  cargar el contenido de la ruta 404  -----
                try {

                    //  -----  volcar la ruta 404 en el dom  -----
                    await loadContent(route404, source);
                    
                    //  -----  devolver la ruta 404 cargada  -----
                    return route404;
                } 
                
                //  -----  si loadContent de la 404 falla  -----
                catch (err) {

                    //  -----  registrar el error de la 404  -----
                    console.error(`Error loadContent 404 (${source}):`, err);
                   
                    //  -----  notificar el error de la 404  -----
                    notifyRouteLoadError(route404, err, source);
                    
                    //  -----  devolver undefined  -----
                    return undefined;
                }

            };



            /*
                *  ---------------------------------------------------------------  *
                *  -----  Carga de contenido dinámico, Componentes del DOM   -----  *
                *  -----  y Metadatos de la Ruta (título, favicon, CSS, JS)  -----  *
                *  ---------------------------------------------------------------  *
            */


            /**
             * ----------------------------------------
             * -----  `notifyRouteLoaded(route)`  -----
             * ----------------------------------------
             * - Notifica que una ruta SPA terminó de renderizarse.
             * - Emite `spa:route-loaded` en cada navegación.
             * - Emite `spa:first-route-loaded` una sola vez al arrancar.
             * @param {Route} route - Ruta que acaba de cargarse.
             */
            const notifyRouteLoaded = (route) => {

                //  -----  emitir el evento spa:route-loaded  -----
                document.dispatchEvent(
                    
                    new CustomEvent('spa:route-loaded', {
                        detail: {
                            id: route?.id || null,
                            path: route?.path || window.location.pathname
                        }
                    })
                );

                //  -----  si es la primera ruta de la sesión  -----
                if (!window.__spaFirstRouteLoaded) {
                    
                    //  -----  marcar la primera carga como hecha  -----
                    window.__spaFirstRouteLoaded = true;
                    
                    //  -----  emitir spa:first-route-loaded  -----
                    document.dispatchEvent(
                        new CustomEvent('spa:first-route-loaded')
                    );
                }

            };



            /**
             * ----------------------------------
             * -----  `loadContent(route)`  -----
             * ----------------------------------
             *
             * Estrategia en 3 fases para soportar View Transitions sin TimeoutError:
             *   1) Precargar TODO el HTML con el método `.load()` de jQuery FUERA de la transición (async).
             *   2) Mutar el DOM DENTRO de `document.startViewTransition` con un callback
             *      SÍNCRONO, de modo que Chrome no aborta la animación por timeout.
             *   3) Cargar los scripts dinámicos DESPUÉS de la transición
             *      (necesitan el DOM ya mutado).
             * Si el navegador no soporta View Transitions, la mutación se aplica directamente.
             *
             * `Guard de navegación`: jQuery no expone un AbortController como fetch(), así que en vez de
             * abortar la petición en curso (FASE 1) usamos un "token" incremental (`navigationToken`):
             * si durante la precarga se inicia una navegación más reciente, la respuesta de la anterior
             * se descarta sin llegar a mutar el DOM (evita "parpadeos" ante clics rápidos/atrás-adelante).
             *
             * @async
             * @param {Route} route - `Ruta a cargar`
             * @param {'init'|'click'|'popstate'} [source='click'] - `Origen de la navegación`
             * @returns {Promise<void>} - `Termina cuando la ruta ya está volcada en el DOM`
             */
            const loadContent = async (route, source = 'click') => {


                //  -----  si la ruta no es válida, salir  -----
                if (!route) {
                    
                    //  -----  avisar de que la ruta no es válida  -----
                    console.warn('loadContent: ruta inválida');
                    
                    //  -----  salir sin cargar  -----
                    return;
                }


                /** - `Token de esta navegación, para descartarla si llega otra más reciente` */
                const myNavigationToken = ++navigationToken;


                //  -----  precargar el html y volcarlo en el dom  -----
                try {

                    //  *  =================================================================================================
                    //  *    FASE 1 — Precargar TODO el HTML con el método `.load()` de jQuery FUERA de la View Transition
                    //  *  =================================================================================================

                    /** - `HTML de la ruta ya descargado, listo para volcar al DOM` */
                    const payload = await preloadRouteContent(route);

                    //  -----  Si mientras precargábamos se disparó una navegación más reciente, descartar  -----
                    if (myNavigationToken !== navigationToken) {
                        
                        //  -----  avisar de que esta navegación queda obsoleta  -----
                        console.info(`⏭️ Navegación descartada (obsoleta): ${route?.id || '(sin id)'}`);
                        
                        //  -----  descartar esta navegación  -----
                        return;
                    }


                    //  *  =============================================================================
                    //  *    FASE 2 — Mutar el DOM DENTRO de startViewTransition con callback SÍNCRONO
                    //  *  =============================================================================

                    /** - `Vuelca el payload precargado al DOM de forma síncrona` */
                    const mutate = () => applyPreloadedContent(payload, route, source);

                    //  -----  si el navegador soporta view transitions  -----
                    if (document.startViewTransition) {

                        /** - `Transición de vista de esta navegación` */
                        const viewTransition = document.startViewTransition(() => mutate());

                        //  -----  Esperar solo a que el DOM quede mutado, NO a que termine la animación  -----
                        await viewTransition.updateCallbackDone.catch(() => { });

                        //  -----  La animación finaliza en segundo plano sin bloquear FASE 3  -----
                        viewTransition.finished.catch(() => { });

                    } 
                    
                    //  -----  si no hay view transitions, volcar el html directamente  -----
                    else {

                        //  -----  volcar el html precargado  -----
                        mutate();

                    }

                    //  *  ==========================================================
                    //  *    FASE 3 — Cargar scripts dinámicos con el DOM ya mutado
                    //  *  ==========================================================
                    
                    //  -----  cargar scripts y librerías con el dom ya mutado  -----
                    await applyRouteMetaAsync(route);

                    //  -----  avisar de que la ruta ya está en el dom  -----
                    notifyRouteLoaded(route);
                } 
                
                //  -----  si la carga de la ruta falla  -----
                catch (err) {

                    //  -----  notificar el error de carga  -----
                    notifyRouteLoadError(route, err, source);
                    
                    //  -----  relanzar el error  -----
                    throw err;

                }

            };



            /*
                *  ----------------------------------------------------------------------------------------------------  *
                *  -----  Funciones auxiliares para manejo de URLs en HTML inyectado (src, href, poster, srcset)  -----  *
                *  ----------------------------------------------------------------------------------------------------  *
            */


            /**
             * -------------------------------------------------------
             * -----  `resolveInjectedAssetUrl(value, baseUrl)`  -----
             * -------------------------------------------------------
             * - Normaliza rutas de recursos dentro de HTML inyectado.
             * - Soporta rutas relativas al archivo HTML fuente y rutas absolutas prefijadas con settings.base.
             * @param {string} value - Valor del atributo (src, href, poster, etc.)
             * @param {string} baseUrl - URL del archivo HTML inyectado
             * @returns {string} - `URL del recurso, lista para insertarla en el HTML`
             */
            const resolveInjectedAssetUrl = (value, baseUrl) => {

                /** - `Valor del atributo, recortado` */
                const raw = String(value || '').trim();

                //  -----  Ignorar anchors, data URI, protocolos externos y especiales  -----
                if (!raw || /^#|^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(raw) || /^(data|blob|mailto|tel|javascript):/i.test(raw))
                    //  -----  devolver el valor original  -----
                    return value;

                //  -----  Si es ruta absoluta desde raíz, prefijar base de la SPA (si aplica)  -----
                if (raw.startsWith('/')) {

                    /** - `Base de la SPA sin barra final` */
                    const base = (settings.base || '').replace(/\/$/, '');

                    //  -----  si no hay base, dejar la ruta absoluta  -----
                    if (!base)
                        
                        //  -----  devolver la ruta absoluta  -----
                        return raw;

                    //  -----  si la ruta ya incluye la base, no duplicarla  -----
                    if (raw === base || raw.startsWith(`${base}/`))
                        
                        //  -----  devolver la ruta tal cual  -----
                        return raw;

                    //  -----  anteponer la base de la spa  -----
                    return `${base}${raw}`;
                }


                //  -----  Resolver rutas relativas contra la URL del HTML inyectado  -----
                try {

                    /** - `URL absoluta del recurso respecto al HTML inyectado` */
                    const resolved = new URL(raw, new URL(baseUrl, window.location.origin));

                    //  -----  devolver pathname, búsqueda y hash  -----
                    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
                } 
                
                //  -----  si la url relativa no se puede resolver  -----
                catch (e) {
                    
                    //  -----  devolver el valor original  -----
                    return value;
                }
            };



            /**
             * --------------------------------------------------------
             * -----  `rewriteInjectedHtmlUrls(html, sourceUrl)`  -----
             * --------------------------------------------------------
             * - Reescribe URLs de recursos (src, href, poster, srcset) en un STRING de HTML
             *   ANTES de insertarlo en el DOM real, usando `<template>` como "parser" inerte:
             *   el contenido de `<template>` (`.content`) NO tiene "browsing context", así que
             *   el navegador NO intenta descargar imágenes mientras lo parseamos aquí.
             * - `Por qué hace falta`: si se insertara el HTML SIN corregir (con rutas relativas
             *   tipo `../../../assets/...`) en un elemento "vivo" —aunque esté desconectado del
             *   DOM—, el navegador SÍ intenta resolverlas y descargarlas de inmediato contra la
             *   URL de la página (ruta incorrecta), y al corregirlas después se dispara una
             *   SEGUNDA petición con la ruta correcta: de ahí las peticiones de `.svg` "duplicadas"
             *   (una con 404/ruta mala + otra correcta) que se veían en la consola del navegador.
             *   Reescribiendo el string primero, solo se dispara UNA petición (ya con la URL buena)
             *   cuando el HTML se inyecta en el contenedor real durante la FASE 2.
             * @param {string} html - HTML crudo devuelto por `.load()`.
             * @param {string} sourceUrl - URL del archivo HTML origen (usada para resolver rutas relativas).
             * @returns {string} - `HTML con las URLs ya corregidas, listo para insertar en el DOM real`.
             */
            const rewriteInjectedHtmlUrls = (html, sourceUrl) => {

                /** @type {HTMLTemplateElement} - `.content` es un DocumentFragment inerte (sin browsing context)` */
                const template = document.createElement('template');

                //  -----  volcar el html en un template inerte  -----
                template.innerHTML = html;

                //  -----  recorrer los nodos con src, href, poster o srcset  -----
                template.content.querySelectorAll('[src],[href],[poster],[srcset]').forEach((node) => {

                    //  -----  si el nodo tiene src, reescribirlo  -----
                    if (node.hasAttribute('src')) {

                        /** - `Valor actual del atributo src` */
                        const src = node.getAttribute('src');

                        //  -----  si hay valor en src, sustituirlo  -----
                        if (src)
                            
                            //  -----  escribir el src ya resuelto  -----
                            node.setAttribute('src', resolveInjectedAssetUrl(src, sourceUrl));
                    }


                    //  -----  si el nodo tiene href, reescribirlo  -----
                    if (node.hasAttribute('href')) {

                        /** - `Valor actual del atributo href` */
                        const href = node.getAttribute('href');

                        //  -----  si hay valor en href, sustituirlo  -----
                        if (href)
                            //  -----  escribir el href ya resuelto  -----
                            node.setAttribute('href', resolveInjectedAssetUrl(href, sourceUrl));
                    }


                    //  -----  si el nodo tiene poster, reescribirlo  -----
                    if (node.hasAttribute('poster')) {

                        /** - `Valor actual del atributo poster` */
                        const poster = node.getAttribute('poster');

                        //  -----  si hay valor en poster, sustituirlo  -----
                        if (poster)
                            
                            //  -----  escribir el poster ya resuelto  -----
                            node.setAttribute('poster', resolveInjectedAssetUrl(poster, sourceUrl));
                    }


                    //  -----  si el nodo tiene srcset, reescribirlo  -----
                    if (node.hasAttribute('srcset')) {

                        /** - `Valor actual del atributo srcset` */
                        const srcset = node.getAttribute('srcset');

                        //  -----  si hay valor en srcset, normalizar cada candidato  -----
                        if (srcset) {

                            /** - `srcset con cada URL ya resuelta` */
                            const normalized = srcset
                                .split(',')
                                .map((entry) => {

                                    /** - `Candidato de srcset, sin espacios` */
                                    const value = entry.trim();

                                    //  -----  si el candidato está vacío, dejarlo igual  -----
                                    if (!value)
                                        
                                        //  -----  devolver el candidato vacío  -----
                                        return value;

                                    /** - `URL del candidato y su descriptor (1x, 2x, ancho)` */
                                    const [srcCandidate, descriptor] = value.split(/\s+/, 2);

                                    /** - `URL del candidato ya resuelta` */
                                    const resolvedSrc = resolveInjectedAssetUrl(srcCandidate, sourceUrl);

                                    //  -----  devolver la url resuelta con su descriptor  -----
                                    return descriptor ? `${resolvedSrc} ${descriptor}` : resolvedSrc;

                                })
                                .join(', ');

                            //  -----  escribir el srcset ya resuelto  -----
                            node.setAttribute('srcset', normalized);
                        }
                    }

                });

                //  -----  devolver el html con las urls corregidas  -----
                return template.innerHTML;

            };


            /**
             * -------------------------------------
             * -----  `fetchHtmlContent(url)`  -----
             * -------------------------------------
             * - `FASE 1` — Descarga HTML como string usando el método `.load()` de jQuery
             *   (filosofía del plugin), pero SIN provocar efectos secundarios en el DOM real:
             *   `.load()` se invoca sobre un `<div>` creado en un DOCUMENTO INERTE (vía
             *   `document.implementation.createHTMLDocument()`, sin "browsing context"), así el
             *   volcado interno que hace jQuery (`self.html(responseText)`) NO dispara peticiones
             *   de red por imágenes con rutas relativas todavía sin corregir.
             * - Tras la descarga, reescribe las URLs del HTML (`rewriteInjectedHtmlUrls`) para que,
             *   al insertarse en FASE 2 en el contenedor real, solo se dispare UNA petición por
             *   recurso (ya con la ruta correcta) — evita los `.svg` "duplicados"/erróneos en consola.
             * - En caso de error, devuelve un HTML de fallback (mismo criterio que v4)
             *   en vez de rechazar la promesa, para no abortar el resto de la precarga.
             * @param {string} url - URL del archivo HTML a descargar.
             * @returns {Promise<string>} - `HTML (con URLs ya corregidas) como string, listo para .html()`.
             */
            const fetchHtmlContent = (url) => {

                //  -----  devolver la promesa de la descarga  -----
                return new Promise((resolve) => {
                    
                    /** @type {JQuery<HTMLDivElement>} - `Buffer inerte: .load() fetch + parsea aquí, sin tocar la página real ni disparar fetches erróneos` */
                    const $buffer = $(document.implementation.createHTMLDocument('').createElement('div'));

                    /*
                        *  -------------------------------------------------------  *
                        *  -----  .load() de jQuery,  La Esencia del plugin  -----  *
                        *  -------------------------------------------------------  *
                    */

                    //  -----  descargar el html con .load() sobre el buffer inerte  -----
                    $buffer.load(url, function (responseText, textStatus, xhr) {

                        //  -----  si la descarga falla, resolver con un html de error  -----
                        if (textStatus === 'error') {

                            //  -----  registrar el error de descarga  -----
                            console.error(`❌ fetchHtmlContent: ${xhr?.status || ''} ${xhr?.statusText || ''} → ${url}`);

                            //  -----  resolver la promesa con el html de error  -----
                            resolve(`<p>Error ${xhr?.status || ''} al cargar: ${url}</p>`);
                            
                            //  -----  salir del callback de error  -----
                            return;
                        }

                        //  -----  resolver la promesa con el html y las urls corregidas  -----
                        resolve(rewriteInjectedHtmlUrls(String(responseText ?? ''), url));

                    });

                });

            };



            /**
             * --------------------------------------
             * -----  `RoutePreloadPayload` {}  -----
             * --------------------------------------
             * @typedef {Object} RoutePreloadPayload - Contenido HTML precargado por `preloadRouteContent` (FASE 1),
             *   listo para inyectar de forma síncrona en `applyPreloadedContent` (FASE 2).
             * @property {Array<{selector: string, hide: true} | {selector: string, url: string, html: string, hide?: false}>} components
             * @property {Array<{target: string, url: string, html: string}>} pagesComponents
             * @property {Array<{target: string, url: string, html: string}>} markdownShikiHtml
             */


            /**
             * ------------------------------------------
             * -----  `preloadRouteContent(route)`  -----
             * ------------------------------------------
             * `FASE 1` — Descarga en paralelo TODO el HTML de la ruta
             * (components, pagesComponents, MarkdownShikiHtml) vía `.load()`
             * de jQuery, FUERA de cualquier View Transition para evitar TimeoutError.
             *
             * - `route.components` es un objeto `{ "#selector": url }`.
             * - `route.pagesComponents` es un array `{ url, target }[]`.
             * - `route.MarkdownShikiHtml` es un array `{ fileName, urlOutput, target }[]`
             *   (la URL final se construye como `${urlOutput}/${fileName}`).
             * @async
             * @param {Route} route - Ruta a precargar.
             * @returns {Promise<RoutePreloadPayload>} - `payload con el HTML listo para inyectar`.
             */
            const preloadRouteContent = async (route) => {


                /** @type {RoutePreloadPayload} - `HTML precargado de components, pages y markdown` */
                const payload = {
                    components: [],
                    pagesComponents: [],
                    markdownShikiHtml: []
                };


                /**
                 * -----------------------------------
                 * -----  `preloadComponents()`  -----
                 * -----------------------------------
                 * - `Precarga los componentes del layout ({ "#selector": url })` 
                 * @async
                 * @returns {Promise<void>} - `Termina cuando los componentes del layout están en el payload`
                 */
                const preloadComponents = async () => {

                    //  -----  si no hay componentes de layout, salir  -----
                    if (!route.components || typeof route.components !== 'object') return;

                    //  -----  descargar los componentes del layout en paralelo  -----
                    await Promise.all(
                                                
                        Object.entries(route.components).map(async ([selector, url]) => {

                            //  -----  si el componente no tiene url, ocultar su contenedor  -----
                            if (!url) {
                                
                                //  -----  marcar el componente para ocultarlo  -----
                                payload.components.push({ selector, hide: true });
                                
                                //  -----  pasar al siguiente componente  -----
                                return;
                            }

                            /** - `HTML del componente ya descargado` */
                            const html = await fetchHtmlContent(url);
                            
                            //  -----  guardar el html del componente  -----
                            payload.components.push({ selector, url, html });

                        })
                    );

                };


                /** 
                 * ---------------------------------------
                 * -----  `preloadPageComponents()`  -----
                 * ---------------------------------------
                 * - `Precarga pagesComponents ({ url, target }), que viven dentro del layout` 
                 * @async
                 * @returns {Promise<void>} - `Termina cuando los page components están en el payload`
                 */
                const preloadPageComponents = async () => {

                    //  -----  si no hay page components, salir  -----
                    if (!Array.isArray(route.pagesComponents)) return;

                    //  -----  descargar los page components en paralelo  -----
                    await Promise.all(
                        
                        route.pagesComponents.map(async (entry) => {

                            /** - `URL del page component` */
                            const url = entry?.url;

                            /** - `Selector donde se inyecta el page component` */
                            const target = entry?.target;

                            //  -----  si falta url o target, omitir la entrada  -----
                            if (!url || !target) {
                                
                                //  -----  avisar de que la entrada está incompleta  -----
                                console.warn('⚠️ Entrada pagesComponents incompleta (falta url o target). Se omite.');
                                
                                //  -----  pasar a la siguiente entrada  -----
                                return;
                            }

                            /** - `HTML del page component ya descargado` */
                            const html = await fetchHtmlContent(url);
                            
                            //  -----  guardar el html del page component  -----
                            payload.pagesComponents.push({ target, url, html });

                        })
                    );

                };


                /** 
                 * --------------------------------------
                 * -----  `preloadMarkdownShiki()`  -----
                 * --------------------------------------
                 * - `Precarga MarkdownShikiHtml ({ fileName, urlOutput, target })` 
                 * @async
                 * @returns {Promise<void>} - `Termina cuando el HTML Shiki está en el payload`
                 */
                const preloadMarkdownShiki = async () => {

                    //  -----  si no hay markdown shiki, salir  -----
                    if (!Array.isArray(route.MarkdownShikiHtml)) return;

                    //  -----  descargar los html shiki en paralelo  -----
                    await Promise.all(
                        
                        route.MarkdownShikiHtml.map(async (entry) => {

                            /** - `Nombre del archivo Shiki` */
                            const fileName = entry?.fileName;

                            /** - `Carpeta de salida del HTML Shiki` */
                            const urlOutput = entry?.urlOutput;

                            /** - `Selector donde se inyecta el markdown` */
                            const target = entry?.target;

                            //  -----  si falta algún dato, omitir la entrada  -----
                            if (!fileName || !urlOutput || !target) {
                                
                                //  -----  avisar de que la entrada shiki está incompleta  -----
                                console.warn('⚠️ Entrada MarkdownShikiHtml incompleta (falta fileName, urlOutput o target). Se omite.');
                                
                                //  -----  pasar a la siguiente entrada  -----
                                return;
                            }

                            /** @type {string} - `URL final del archivo Shiki a cargar` */
                            const url = `${urlOutput}/${fileName}`;

                            /** - `HTML Shiki ya descargado` */
                            const html = await fetchHtmlContent(url);
                            
                            //  -----  guardar el html shiki  -----
                            payload.markdownShikiHtml.push({ target, url, html });

                        })
                    );

                };


                //  -----  Descargar los tres niveles en paralelo entre sí (no hay dependencia en la descarga)  -----
                await Promise.all([
                    preloadComponents(),
                    preloadPageComponents(),
                    preloadMarkdownShiki()
                ]);

                //  -----  devolver el html precargado  -----
                return payload;

            };



            /**
             * -------------------------------------------------------------
             * -----  `applyPreloadedContent(payload, route, source)`  -----
             * -------------------------------------------------------------
             * `FASE 2` — Muta el DOM de forma SÍNCRONA con el HTML
             * ya precargado (solo `.html()`/`.show()`/`.hide()`, sin fetch ni await).
             * Debe ejecutarse dentro del callback de `document.startViewTransition`
             * para que Chrome NO aborte la animación por timeout.
             *
             * Inyecta en ORDEN DE DEPENDENCIA para que los contenedores anidados
             * existan antes de usarse:
             *   1) components (layoutHeader/layoutNavbar/layoutMain/layoutFooter...) → ya están en el DOM.
             *   2) pagesComponents → viven DENTRO del HTML de (1), se resuelven tras inyectar (1).
             *   3) MarkdownShikiHtml → viven DENTRO del HTML de (2), se resuelven tras inyectar (2).
             *
             * @param {RoutePreloadPayload} payload - HTML precargado por `preloadRouteContent`.
             * @param {Route} route - Ruta actual.
             * @param {'init'|'click'|'popstate'} source - Origen de la navegación.
             */
            const applyPreloadedContent = (payload, route, source) => {

                //  -----  Caso especial: ruta sin componentes  -----
                if (!route.components || Object.keys(route.components).length === 0) {

                    //  -----  avisar de que la ruta no tiene componentes  -----
                    console.warn(`applyPreloadedContent: la ruta ${route.id} no tiene 'components'`);
                    
                    //  -----  aplicar solo los metadatos de la ruta  -----
                    applyRouteMetaSync(route, source);
                    
                    //  -----  salir sin inyectar html  -----
                    return;

                }


                //  -----  (1) Inyectar components (síncrono) — el HTML ya trae las URLs corregidas (FASE 1)  -----
                for (const item of payload.components) {

                    /** - `Contenedor del componente de layout` */
                    const $container = $(item.selector);

                    //  -----  si el componente va oculto, vaciar su contenedor  -----
                    if (item.hide) {
                        
                        //  -----  ocultar y vaciar el contenedor  -----
                        $container.hide().empty();
                        
                        //  -----  pasar al siguiente componente  -----
                        continue;
                    }

                    //  -----  mostrar el html del componente  -----
                    $container.show().html(item.html);

                }


                //  -----  Inicializar acciones del navbar (protegido si no existe en la vista)  -----
                try {
                    
                    //  -----  inicializar el navbar  -----
                    actionsNavbar();
                
                } 
                
                //  -----  si el navbar no está en la vista, seguir  -----
                catch (err) {
                    
                    //  -----  avisar de que el navbar no se pudo iniciar  -----
                    console.warn('actionsNavbar falló (probablemente falta .navbar__container en la vista):', err);
                }


                //  -----  (2) Inyectar pagesComponents (síncrono) — sus contenedores ya existen tras (1)  -----
                for (const { target, html } of payload.pagesComponents) {

                    /** - `Contenedor del page component` */
                    const $container = $(target);

                    //  -----  si el contenedor del page component no existe, omitirlo  -----
                    if (!$container.length) {
                        
                        //  -----  avisar de que falta el contenedor  -----
                        console.warn(`⚠️ Contenedor no encontrado para pageComponent: ${target} — se omite.`);
                        
                        //  -----  pasar al siguiente page component  -----
                        continue;
                    }

                    //  -----  inyectar el html del page component  -----
                    $container.show().html(html);

                }


                //  -----  (3) Inyectar MarkdownShikiHtml (síncrono) — sus contenedores ya existen tras (2)  -----
                for (const { target, html } of payload.markdownShikiHtml) {

                    /** - `Contenedor del markdown Shiki` */
                    const $container = $(target);

                    //  -----  si el contenedor del markdown no existe, omitirlo  -----
                    if (!$container.length) {
                        
                        //  -----  avisar de que falta el contenedor del markdown  -----
                        console.warn(`⚠️ Contenedor no encontrado para Markdown Shiki: ${target} — se omite.`);
                        
                        //  -----  pasar al siguiente markdown  -----
                        continue;
                    }

                    //  -----  inyectar el html del markdown  -----
                    $container.html(html);

                }

                //  -----  Aplicar metadatos síncronos (título, favicon, pushState, CSS)  -----
                applyRouteMetaSync(route, source);

            };



            /**
             * -------------------------------------------------
             * -----  `applyRouteMetaSync(route, source)`  -----
             * -------------------------------------------------
             * - Aplica metadatos SÍNCRONOS de la ruta dentro de Phase 2.
             * - Seguro para ejecutarse dentro del callback de startViewTransition.
             * @param {Route} route - Ruta actual.
             * @param {'init'|'click'|'popstate'} [source='click'] - Origen de navegación.
             */
            const applyRouteMetaSync = (route, source = 'click') => {

                //  -----  Título del Header y Footer  -----
                if (route.headerTitle)
                    //  -----  escribir el título en header y footer  -----
                    addTitleHeaderFooter(route.headerTitle);


                //  -----  Título de la pestaña  -----
                if (route.pageTitle)
                    //  -----  poner el título de la pestaña  -----
                    document.title = route.pageTitle;

                //  -----  Favicon  -----
                if (route.favicon)
                    //  -----  actualizar el favicon  -----
                    updateFavicon(route.favicon);

                //  -----  CSS (crear <link> es síncrono)  -----
                if (route.styles)
                    //  -----  cargar las hojas de estilo de la ruta  -----
                    loadStylesheetByPage(route.styles);


                /*
                    *  --------------------------------------------  *
                    *  -----  pushState seguro (normalizado)  -----  *  
                    *  --------------------------------------------  *
                */

                /** @type {string} - `Nueva pathname para la ruta` */
                const newPathname = buildPathname(route.path || '');


                /**
                 * -------------------------------------
                 * -----  `stripTrailingSlash(p)`  -----
                 * -------------------------------------
                 * - Compara dos pathnames ignorando el trailing slash final.
                 * @param {string} p - `Pathname a comparar`
                 * @returns {string} - `Pathname sin la barra final`
                 */
                const stripTrailingSlash = (p) => {

                    /** - `Pathname sin la barra final` */
                    const s = String(p || '').replace(/\/$/, '');
                    
                    //  -----  devolver la raíz si el pathname queda vacío  -----
                    return s === '' ? '/' : s;
                };


                //  -----  Solo 'click' empuja historial; 'init' y 'popstate' no  -----
                if (source === 'click' && stripTrailingSlash(safeHistoryPathname(window.location.pathname)) !== stripTrailingSlash(newPathname)) {

                    /** @type {RouteManifest|undefined} - `Entrada del manifiesto de la ruta actual` */
                    const manifestEntry = findManifestEntryById(route.id);

                    //  -----  empujar la nueva ruta al historial  -----
                    history.pushState(
                        {
                            id: route.id,
                            path: newPathname,
                            routeFile: manifestEntry?.file || null,
                            favicon: route.favicon || null
                        },
                        '',
                        newPathname
                    );

                    //  -----  avisar por consola que se navegó a la nueva ruta por la url del navegador  -----
                    console.log('\n');
                    console.warn('navigate ==>', route.id, newPathname);
                    console.log('\n');

                }

            };


            /**
             * -----------------------------------------
             * -----  `applyRouteMetaAsync(route)`  -----
             * -----------------------------------------
             * `FASE 3` — Carga scripts y libs DESPUÉS de que el DOM
             * ya está mutado y la View Transition ha terminado.
             * @async
             * @param {Route} route - Ruta actual.
             * @returns {Promise<void>} - `Termina cuando los scripts y las librerías de la ruta ya están cargados`
             */
            const applyRouteMetaAsync = async (route) => {

                //  -----  Cargar libs de jQuery UI bajo demanda (incluye widget tooltip)  -----
                await loadLibsByRoute(route.libs);

                //  -----  Cambio de themes jQuery UI (requiere tooltip de jQuery UI ya cargado)  -----
                try {
                    //  -----  aplicar el theme de jquery ui de la ruta  -----
                    changeThemesJQueryUI();
                }
                
                //  -----  si el cambio de theme falla, seguir con la ruta  -----
                catch (err) {
                    //  -----  avisar de que el theme no se pudo cambiar  -----
                    console.warn('changeThemesJQueryUI falló:', err);
                }

                //  -----  Habilitar elementos draggables tras cargar las libs  -----
                enableDraggables();

                //  -----  Cargar scripts dinámicos de la ruta  -----
                if (route.scripts)
                    //  -----  cargar los scripts de la ruta  -----
                    await loadScriptsByPage(route.scripts);

            };



            /**
             * -------------------------------------------
             * -----  `addTitleHeaderFooter(title)`  -----
             * -------------------------------------------
             * - Agrega el título al header y footer de la página.
             * @param {string} title - Texto para mostrar en ambos lugares.
             */
            const addTitleHeaderFooter = (title) => {

                //  -----  Añadimos el título al header  -----
                /** @type {JQuery<HTMLElement>} - `Título del header` */
                $('#layoutHeader #headerTitle').html(title);

                //  -----  Añadimos el título al footer  -----
                /** @type {JQuery<HTMLElement>} - `Título del footer` */
                $('#layoutFooter #footerTitle').html(title);

            }



            /*
                *  ------------------------------------------------------------  *
                *  -----  Elementos Draggables, Acciones del Navbar  ----------  *
                *  ------------------------------------------------------------  *
            */



            /**
             *  -----------------------------------
             *  -----  `enableDraggables()`   -----
             *  -----------------------------------
             * - Habilita la funcionalidad de elementos arrastrables.
             * - Busca cualquier elemento con la clase `.draggable` y aplica .draggable() (jQuery UI).
             * - Esto evita depender de selectores rígidos.
             */
            const enableDraggables = () => {

                //  -----  activar los elementos arrastrables  -----
                try {

                    //  -----  Iterar sobre cada elemento con clase .draggable y aplicar jQuery UI draggable.  -----
                    $('.draggable').each(function () {

                        //  -----  Si el método draggable está disponible, aplicarlo al elemento actual  -----
                        if ($(this).draggable) {

                            //  -----  Aplicar draggable con scroll desactivado para evitar problemas de scroll durante el arrastre  -----
                            $(this).draggable({
                                scroll: false
                            });
                        }

                    });
                
                } 
                
                //  -----  si jquery ui no está disponible, seguir  -----
                catch (err) {

                    //  -----  si jQuery UI no está presente, no hacer nada  -----
                    console.log('\n');
                    console.warn('jQuery UI draggable no disponible o falló la inicialización.', err);
                    console.log('\n');

                }

            };



            /**
             * -------------------------------
             * -----  `actionsNavbar()`  -----
             * -------------------------------
             * 
             * Inicializa y controla el comportamiento del navbar:
             *
             * - Maneja la apertura y cierre del menú principal.
             * - Maneja la apertura y cierre del menú de themes (jQuery UI).
             * - Garantiza que solo un menú esté abierto a la vez.
             * 
             * - Cierra los menús al hacer click fuera de ellos.
             *
             * - Requiere jQuery.
             *
             * - Elementos esperados en el DOM:
             *     - .navbar__container
             *     - .navbar__btn-open
             *     - .navbar__btn-close
             *     - #linksThemesContainer
             *     - .navbar-ui__btn-open
             *     - .navbar-ui__btn-close
             * 
             */
            const actionsNavbar = () => {


                //*  -----  Declarar los menús  -----

                /**  
                 * ---------------------------
                 * -----  `menuMain` {}  -----
                 * ---------------------------
                 * - `Menú Principal`
                 * @property {JQuery<HTMLElement>} container - Contenedor del menú
                 * @property {JQuery<HTMLElement>} btnOpen   - Botón para abrir
                 * @property {JQuery<HTMLElement>} btnClose  - Botón para cerrar
                 */
                const menuMain = {
                    container: $('.navbar__container'),
                    btnOpen: $('.navbar__btn-open'),
                    btnClose: $('.navbar__btn-close')
                };


                /**  
                 * -----------------------------
                 * -----  `menuThemes` {}  -----
                 * -----------------------------
                 * - `Menú` `Themes jQuery UI`
                 * @property {JQuery<HTMLElement>} container - Contenedor del menú
                 * @property {JQuery<HTMLElement>} btnOpen   - Botón para abrir
                 * @property {JQuery<HTMLElement>} btnClose  - Botón para cerrar
                 */
                const menuThemes = {
                    container: $('#linksThemesContainer'),
                    btnOpen: $('.navbar-ui__btn-open'),
                    btnClose: $('.navbar-ui__btn-close')
                };


                //  -----  Ocultar ambos menús al iniciar  -----
                
                menuMain.container.hide();
                menuMain.btnClose.hide();

                menuThemes.container.hide();
                menuThemes.btnClose.hide();


                //* ----- FUNCIONES ------

                /**
                 * ------------------------------
                 * -----  `openMenu(menu)`  -----
                 * ------------------------------
                 * - `Abre un menú con animación`
                 * @param {Object} menu - Objeto del menú a abrir
                 * @param {JQuery} menu.container - Contenedor del menú
                 * @param {JQuery} menu.btnOpen - Botón para abrir
                 * @param {JQuery} menu.btnClose - Botón para cerrar
                 */
                const openMenu = (menu) => {
                    
                    //  -----  abrir el contenedor del menú  -----
                    menu.container
                        .stop(true, true)
                        .slideDown(250);
                    
                    //  -----  ocultar el botón de abrir  -----
                    menu.btnOpen.hide();
                    
                    //  -----  mostrar el botón de cerrar  -----
                    menu.btnClose.show();
                }


                /**
                 * -------------------------------
                 * -----  `closeMenu(menu)`  -----
                 * -------------------------------
                 * - `Cierra un menú con animación`
                 * @param {Object} menu - Objeto del menú a cerrar
                 * @param {JQuery} menu.container - Contenedor del menú
                 * @param {JQuery} menu.btnOpen - Botón para abrir
                 * @param {JQuery} menu.btnClose - Botón para cerrar
                 */
                const closeMenu = (menu) => {
                    
                    //  -----  cerrar el contenedor del menú  -----
                    menu.container
                        .stop(true, true)
                        .slideUp(250);
                    
                    //  -----  mostrar el botón de abrir  -----
                    menu.btnOpen.show();
                    
                    //  -----  ocultar el botón de cerrar  -----
                    menu.btnClose.hide();
                }


                /**
                 * --------------------------------------------
                 * -----  `clickInside(element, target)`  -----
                 * --------------------------------------------
                 * - `Verifica si un click ocurrió dentro de un elemento`
                 * @param {JQuery<HTMLElement>} element - Elemento base (objeto jQuery)
                 * @param {EventTarget|null} target - Elemento clickeado o Target del evento
                 * @returns {boolean} - `True` si el click fue interno
                 */
                const clickInside = (element, target) => {

                    //  -----  Verificar que target es un HTMLElement  -----
                    if (!(target instanceof HTMLElement)) {
                        
                        //  -----  el click no fue dentro del elemento  -----
                        return false;
                    }

                    //  -----  comprobar si el click cae dentro del elemento  -----
                    return $(target).closest(element).length > 0;

                }


                //* -----  EVENTOS  -----


                //  -----  Evitar handlers duplicados al recargar o navegar entre rutas  -----
                $(document).off('.spaNavbar');


                //  -----  Abrir menú principal  -----
                $(document).on("click.spaNavbar", ".navbar__btn-open", function (e) {

                    //  -----  prevenir propagación del click  -----
                    e.stopPropagation();

                    //  -----  abrir menú principal  -----
                    openMenu(menuMain);

                    //  -----  cerrar menú themes UI  -----
                    closeMenu(menuThemes);

                });


                //  -----  Cerrar menú principal  -----
                $(document).on("click.spaNavbar", ".navbar__btn-close", function (e) {

                    //  -----  prevenir propagación del click  -----
                    e.stopPropagation();

                    //  -----  cerrar menú principal  -----
                    closeMenu(menuMain);

                });


                //  -----  Abrir menú themes UI  -----
                $(document).on("click.spaNavbar", ".navbar-ui__btn-open", function (e) {

                    //  -----  prevenir propagación del click  -----
                    e.stopPropagation();

                    //  -----  abrir menú themes UI  -----
                    openMenu(menuThemes);

                    //  -----  cerrar menú principal  -----
                    closeMenu(menuMain);

                });


                //  -----  Cerrar menú themes UI  -----
                $(document).on("click.spaNavbar", ".navbar-ui__btn-close", function (e) {

                    //  -----  prevenir propagación del click  -----
                    e.stopPropagation();

                    //  -----  cerrar menú themes UI  -----
                    closeMenu(menuThemes);

                });


                // -----  Click Fuera de los Menús  -----
                $(document).on("click.spaNavbar", function (e) {

                    //  -----  Verificar si el click fue dentro de algún menú  -----

                    /** @type {boolean} - `Click dentro del menú principal` */
                    const clickMain =
                        clickInside(menuMain.container, e.target) ||
                        clickInside(menuMain.btnOpen, e.target);

                    /** @type {boolean} - `Click dentro del menú themes` */
                    const clickThemes =
                        clickInside(menuThemes.container, e.target) ||
                        clickInside(menuThemes.btnOpen, e.target);


                    //  -----  Si el click fue fuera, cerrar ambos menús  -----   

                    if (!clickMain)
                        //  -----  cerrar el menú principal  -----
                        closeMenu(menuMain);


                    //  -----  si el click fue fuera del menú de themes, cerrarlo  -----
                    if (!clickThemes)
                        //  -----  cerrar el menú de themes  -----
                        closeMenu(menuThemes);

                });

            };



            /**
             * --------------------------------------
             * -----  `changeThemesJQueryUI()`  -----
             * --------------------------------------
             * - Cambia las themes de jQuery UI dinámicamente.
             */
            const changeThemesJQueryUI = () => {

                /** @type {JQuery<HTMLLinkElement>} - `id del elemento link de la hoja de estilos de jquery UI` */
                const $theme = $('#theme');

                /** @type {JQuery<HTMLElement>} - `contenedor de los links de themes` */
                const $linksThemesContainer = $('#linksThemesContainer');

                //  -----  si faltan el contenedor o el link del theme, salir  -----
                if (!$linksThemesContainer.length || !$theme.length)
                    //  -----  salir sin enlazar el cambio de theme  -----
                    return;

                /** @type {string} - `Path de las themes de jQuery UI` */
                const pathThemes = `${settings.base}/app/libs/jquery/ui/themes`;

                //  -----  avisar por consola la path de las themes de jQuery UI  -----
                console.log('\n');
                console.warn(`-----  jQuery UI Themes Path: ${pathThemes}  -----`);
                console.log('\n');

                //  -----  Evitar handlers duplicados al recargar o navegar entre rutas  -----
                $linksThemesContainer.off('click.spaThemeChange', 'a');


                /** 
                 * -----------------------------
                 * ----- `disabledActive()`----- 
                 * -----------------------------
                 * - desactiva la clase active de todos los links de themes
                 */
                const disabledActive = () => {

                    //  -----  encontrar los links de themes y quitar la clase active de todos ellos  -----
                    $linksThemesContainer
                        .find("a")
                        .removeClass('active');
                }


                //  -----  Evento click en los links de themes  -----
                $linksThemesContainer.on("click.spaThemeChange", "a", function (e) {

                    //  -----  prevenir acción por defecto del link  -----
                    e.preventDefault();

                    /** @type {string|null|undefined} - `Nombre del theme seleccionado` */
                    const themeName = $(this).data("theme");

                    //  -----  si el enlace no trae nombre de theme, salir  -----
                    if (!themeName)
                        //  -----  salir sin cambiar el theme  -----
                        return;

                    //  -----  prevenir propagación antes de mutar DOM (evita cierre del menú / tooltips)  -----
                    e.stopPropagation();

                    //  -----  Cambiar href del link del theme  -----
                    $theme.attr("href", `${pathThemes}/${themeName}/jquery-ui.min.css`);

                    //  -----  avisar por consola el theme cambiado  -----
                    console.log('\n');
                    console.warn(`-----  Theme changed to: ${themeName}  -----`);
                    console.log('\n');

                    //  -----  desactivar clase active de todos los links  -----
                    disabledActive();

                    //  -----  marcar link como activo  -----
                    $(this).addClass("active");

                });

            }
            


            /*
                *  --------------------------------  *
                *  -----  Actualizar Favicon  -----  *
                *  --------------------------------  *
            */


            /**
             * --------------------------------------
             * -----  `updateFavicon(favicon)`  -----
             * --------------------------------------
             * - Actualiza el favicon del documento.
             * - Solo modifica el `href` cuando el favicon cambia realmente;
             *   esto evita el parpadeo (y la recarga innecesaria) producido
             *   al inyectar un `?t=Date.now()` distinto en cada navegación,
             *   incluso en popstate/atrás. El navegador ya cachea por URL:
             *   cambiar de `html-icon.svg` a `css-icon.svg` refresca el icono,
             *   pero repetir la misma URL no vuelca a descargar.
             * @param {string} favicon - URL del nuevo favicon a cargar
             */
            const updateFavicon = (favicon) => {

                /** 
                 * - URL absoluta del nuevo favicon, resuelta contra baseURI: permite comparar de forma fiable ruta relativa (index.html) vs absoluta (ruta) 
                 *   cuando apuntan al mismo archivo.
                 * @type {string}
                 */
                const newAbsolute = new URL(favicon, document.baseURI).href;

                /** @type {JQuery<HTMLLinkElement>} - `Elemento link del favicon` */
                let $favicon = $('link[rel~="icon"]');

                //  -----  Si no existe el favicon, lo creamos  -----
                if ($favicon.length === 0) {

                    /** @type {HTMLLinkElement} - `Crear un nuevo elemento link para el favicon si no existe` */
                    const link = document.createElement('link');

                    //  -----  Configurar el nuevo elemento link para el favicon  -----
                    link.rel = "icon";

                    //  -----  Añadir el nuevo elemento link al head del documento  -----
                    document.head.appendChild(link);

                    //  -----  Asignar el nuevo elemento link a $favicon para futuras actualizaciones  -----
                    $favicon = $(link);
                }

                
                /** 
                 * - Comparar la URL ABSOLUTA YA RESUELTA (prop('href'), no attr) sin query string (?...) contra la nueva
                 * @type {string}
                 */
                const currentAbsolute = String($favicon.prop('href') || '').split('?')[0];

                //  -----  Actualizar el href solo si el archivo cambia realmente: evita reasignar el atributo (relativo -> absoluto del mismo archivo), que provoca re-descarga y parpadeo  -----
                if (currentAbsolute !== newAbsolute)
                    //  -----  apuntar el favicon a la url nueva  -----
                    $favicon.attr('href', favicon);

            };


            /*
                *  -------------------------  *
                *  -----  STYLESHEETS  -----  *
                *  -------------------------  *
            */


            /**
            * ------------------------------------------
            * -----  loadStylesheetByPage(styles)  -----
            * ------------------------------------------
            * - Carga múltiples hojas de estilo para la página sin bloquear el hilo.
            * - Preload antes de aplicar para evitar parpadeos.
            * @param {RouteStyle[] | RouteStyle | null | undefined} styles - `Array o único objeto de estilos a cargar para la ruta. 
            * Cada estilo debe tener al menos una propiedad 'href' con la URL de la hoja de estilo.`
            */
            const loadStylesheetByPage = (styles) => {


                //  -----  Si no hay estilos, salir  -----
                if (!styles)
                    //  -----  salir si la ruta no trae estilos  -----
                    return;

                /** @type {RouteStyle[]} - `Array de estilos a cargar` */
                const list = Array.isArray(styles) ? styles : [styles];

                /** @type {string[]} - `Array de hrefs de estilos a cargar` */
                const hrefsToLoad = list.map(s => s?.href).filter(Boolean);

                /** @type {HTMLHeadElement} - `Elemento head del documento` */
                const head = document.head;

                /** @type {NodeListOf<HTMLLinkElement>} - `Hojas de estilo marcadas como estilos de página` */
                const pageStyleLinks = (head.querySelectorAll('link[data-page-style="true"]'));

                //  -----  Eliminar solo los estilos que NO se van a recargar  -----
                pageStyleLinks.forEach(link => {

                    //  -----  si el estilo no se va a reutilizar, quitarlo  -----
                    if (!hrefsToLoad.some(h => link.href.includes(h)))
                        //  -----  eliminar el link de estilo  -----
                        link.remove();

                });


                //  -----  Preload y luego aplicar  -----
                hrefsToLoad.forEach(href => {

                    //  -----  si ese estilo ya está en el head, no recargarlo  -----
                    if (head.querySelector(`link[data-page-style="true"][href*="${href}"]`)) 
                        //  -----  pasar al siguiente estilo  -----
                        return;

                    /** @type {HTMLLinkElement} - `Preload para no bloquear repaints` */
                    const preload = document.createElement('link');

                    //  -----  Configurar el elemento preload para la hoja de estilo  -----
                    preload.rel = 'preload';
                    preload.as = 'style';
                    preload.href = href;

                    //  -----  Añadir el elemento preload al head del documento  -----
                    head.appendChild(preload);

                    //  -----  Aplicar después de que preload cargue  -----
                    preload.onload = () => {

                        /** @type {HTMLLinkElement} - `Elemento link para la hoja de estilo` */
                        const link = document.createElement('link');

                        //  -----  Configurar el elemento link para la hoja de estilo  -----
                        link.rel = 'stylesheet';
                        link.href = href; // ✅ producción: sin ?t

                        //  -----  Marcar el link como un estilo de página para futuras gestiones  -----
                        link.dataset.pageStyle = 'true';

                        //  -----  Añadir el elemento link al head del documento  -----
                        head.appendChild(link);

                        //  -----  quitar el preload cuando la hoja ya está aplicada  -----
                        preload.remove();

                    };

                });

            };


            /*
                *  ---------------------  *
                *  -----  SCRIPTS  -----  *
                *  ---------------------  *
            */


            /**
             * ------------------------------------------
             * -----  `loadScriptsByPage(scripts)`  -----
             * ------------------------------------------
             * - Carga múltiples scripts para la página.
             * - Antes elimina los scripts dinámicos previos.
             * @param {RouteScript[]|object} scripts - `Array o diccionario de scripts a cargar para la ruta. 
             * Cada script debe tener al menos una propiedad 'src' con la URL del script.`
             */
            const loadScriptsByPage = (scripts) => {

                //  -----  Remover scripts anteriores  -----
                //  - Solo elimina scripts cargados por rutas → seguros

                /** @type {JQuery<HTMLScriptElement>} - `Scripts de ruta marcados como data-page-script` */
                const $pageScripts = $('script[data-page-script="true"]');

                //  -----  eliminar los scripts de la ruta anterior  -----
                $pageScripts.remove();

                //  -----  Si no hay scripts, salir  -----
                if (!scripts)
                    //  -----  salir si la ruta no trae scripts  -----
                    return Promise.resolve();


                //  -----  Aceptar array o diccionario  -----

                /** @type {RouteScript[]} - `Array de scripts a cargar` */
                const scriptArray = Array.isArray(scripts)
                    ? scripts
                    : Object.values(scripts);

                /** - `Cola que carga los scripts uno detrás de otro` */
                let scriptQueue = Promise.resolve();

                //  -----  Iterar sobre cada script y cargarlo en orden  -----
                scriptArray.forEach(script => {

                    //  -----  si el script no tiene src, omitirlo  -----
                    if (!script?.src)
                        //  -----  pasar al siguiente script  -----
                        return;

                    //  -----  encolar la carga de este script  -----
                    scriptQueue = scriptQueue.then(() => loadScripts(script));

                });

                //  -----  devolver la cola de scripts  -----
                return scriptQueue;
            };



            /**
             * ---------------------------------------
             * -----  `loadScripts(scriptUrl)`  ------
             * ---------------------------------------
             * - Carga un script (verifica con HEAD)
             * - Soporta scripts clásicos y módulos ES6 (type="module")
             *  @param {RouteScript} scriptOptions - Configuración del script a cargar
             * @returns {Promise<void>} - `Termina cuando el script se ha cargado o se ha descartado el fallo`
             */
            const loadScripts = (scriptOptions) => {

                /** @type {string} - `URL del script a cargar` */
                const scriptUrl = String(scriptOptions?.src || '');

                /** @type {'classic'|'module'} - `Tipo de carga del script` */
                const scriptType = (scriptOptions?.type === 'module') ? 'module' : 'classic';

                /** @type {string|null} - `Export opcional del módulo a ejecutar tras la carga` */
                const exportFunctionName = scriptOptions?.exportFunctionName || null;


                //  -----  Devolver una promesa que se resuelve cuando el script se carga o si ocurre un error  -----
                return new Promise((resolve) => {

                    //  -----  si no hay url, resolver sin cargar  -----
                    if (!scriptUrl) {
                        //  -----  resolver la promesa vacía  -----
                        resolve();
                        //  -----  salir sin pedir el script  -----
                        return;
                    }


                    //  -----  Verificar que el script existe con una petición HEAD con el método .ajax()  -----
                    $.ajax({
                        
                        url: scriptUrl,
                        type: 'HEAD',

                        //  -----  Si el script existe cargar como script clásico o módulo ES6  -----
                        success: function () {

                            /** @type {string} - `URL con cache bypass para forzar recarga del script o módulo` */
                            const urlWithCacheBypass = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;

                            //  -----  Si el script es un módulo ES6, cargar con import() dinámico  -----
                            if (scriptType === 'module') {

                                //  -----  importar el módulo con cache bypass  -----
                                import(urlWithCacheBypass)

                                    .then((
                                        /** @type {Record<string, unknown>} - `Módulo ESM importado` */
                                        module
                                    ) => {

                                        //  -----  avisar por consola que se cargó el módulo  -----
                                        console.log(`Módulo cargado: ${scriptUrl}`);

                                        /** @type {unknown} - `Export pedido al módulo` */
                                        const exported = exportFunctionName ? module[exportFunctionName] : null;

                                        //  -----  si el módulo exporta la función indicada, ejecutarla  -----
                                        if (typeof exported === 'function') {

                                            /** - `Función exportada lista para ejecutar` */
                                            const run = /** @type {() => void} */ (exported);

                                            //  -----  ejecutar el export del módulo  -----
                                            run();

                                        }

                                        //  -----  resolver la promesa del módulo  -----
                                        resolve();

                                    })

                                    //  -----  si el módulo falla, registrar el error y seguir  -----
                                    .catch((error) => {

                                        //  -----  avisar por consola el error al cargar el módulo  -----
                                        console.log('\n');
                                        console.error(`Error en módulo ${scriptUrl}:`, error);
                                        console.log('\n');

                                        //  -----  resolver la promesa aunque el módulo falle  -----
                                        resolve();

                                    });

                                //  -----  salir tras lanzar el import del módulo  -----
                                return;

                            }


                            //  -----  Si el script es clásico, cargar con jQuery.getScript()  -----
                            $.getScript(urlWithCacheBypass)

                                //  -----  Marcar el script como data-page-script para futuras gestiones  -----
                                .done(() => {

                                    //  -----  avisar por consola que se cargó el script  -----
                                    console.log(`Cargado: ${scriptUrl}`);

                                    /** @type {NodeListOf<HTMLScriptElement>} - `Todos los scripts en el documento` */
                                    const scripts = document.querySelectorAll('script');

                                    /** @type {HTMLScriptElement} - `Último script en el documento` */
                                    const lastScript = scripts[scripts.length - 1];

                                    //  -----  Marcar el último script cargado con jQuery.getScript() como data-page-script  -----
                                    if (lastScript && lastScript.src.includes(scriptUrl))
                                        //  -----  marcar el script como script de página  -----
                                        lastScript.dataset.pageScript = "true";

                                    //  -----  resolver la promesa del script clásico  -----
                                    resolve();

                                })

                                //  -----  Manejar errores de carga del script  -----
                                .fail((jqxhr, settings, exception) => {

                                    //  -----  avisar por consola el error al cargar el script  -----
                                    console.log('\n');
                                    console.error(`Error en ${scriptUrl}:`, exception);
                                    console.log('\n');

                                    //  -----  resolver la promesa aunque el script falle  -----
                                    resolve();

                                });

                        },

                        //  -----  Si el script no existe, mostrar advertencia en consola  -----
                        error: function () {

                            //  -----  avisar por consola que el script no existe  -----
                            console.log('\n');
                            console.warn(`No existe el script: ${scriptUrl}`);
                            console.log('\n');

                            //  -----  resolver la promesa si el script no existe  -----
                            resolve();

                        }

                    });

                });

            };


            /**
             * -------------------------------------
             * -----  `loadLibsByRoute(libs)`  -----
             * -------------------------------------
             * - Carga los módulos de jQuery UI declarados en `route.libs` bajo demanda.
             * - Se ejecuta después de que el DOM de la ruta está completamente renderizado.
             * - Usa `settings.libLoader` para importar cada módulo por nombre.
             * @async
             * @param {RouteLib[]|null|undefined} libs - Lista de librerías a cargar para la ruta.
             * @returns {Promise<void>} - `Termina cuando las librerías de la ruta ya se han importado`
             */
            const loadLibsByRoute = async (libs) => {

                //  -----  si no hay librerías o no hay cargador, salir  -----
                if (!libs?.length || typeof settings.libLoader !== 'function')
                    //  -----  salir sin cargar librerías  -----
                    return;

                //  -----  recorrer las librerías de la ruta  -----
                for (const lib of libs) {

                    //  -----  si la librería no tiene nombre, omitirla  -----
                    if (!lib?.name)
                        //  -----  pasar a la siguiente librería  -----
                        continue;

                    //  -----  importar la librería por nombre  -----
                    try {

                        //  -----  cargar el módulo con libLoader  -----
                        await settings.libLoader(lib.name);

                    //  -----  si la librería falla, registrarlo y seguir  -----
                    } catch (err) {

                        //  -----  avisar por consola el error al cargar la librería  -----
                        console.log('\n');
                        console.error(`Error cargando lib "${lib.name}":`, err);
                        console.log('\n');
                    }
                }

            };


            /**
             * ----------------------
             * -----  `init()`  -----
             * ----------------------
             * - `Inicializa la app: encuentra la ruta inicial y la carga, o la 404`.
             * @async
             */
            const init = async () => {

                /** @type {string} - `Pathname actual del navegador, normalizado para history API` */
                const initialPath = safeHistoryPathname(window.location.pathname);

                /** @type {RouteManifest|undefined} - `Entrada inicial del manifest` */
                const entry = findManifestEntryByPath(initialPath);

                //  -----  si la url inicial está en el manifiesto, cargarla  -----
                if (entry) {

                    //  -----  cargar la ruta inicial  -----
                    try {

                        /** @type {Route|undefined} - `Módulo de la ruta inicial` */
                        let route = await loadRouteModule(entry.file);

                        //  -----  si el módulo existe, cargar su contenido  -----
                        if (route)
                            //  -----  volcar la ruta inicial  -----
                            await loadContent(route, 'init');

                        //  -----  cargar la 404 si el módulo no existe  -----
                        else
                            route = await loadNotFoundRoute('init');

                        //  -----  si no hay ruta, dejar el historial en la url actual  -----
                        if (!route) {

                            //  -----  reemplazar el state sin ruta  -----
                            history.replaceState(
                                { id: null, path: initialPath },
                                '',
                                initialPath
                            );

                            //  -----  salir de esta resolución  -----
                            return;
                        }

                        /** - `Pathname inicial normalizado para replaceState` */
                        const initialPathname = buildPathname(route.path || entry.path || '');

                        //  -----  fijar el state de la ruta inicial  -----
                        history.replaceState(
                            { id: route.id, path: initialPathname, routeFile: entry.file, favicon: route.favicon || null },
                            '',
                            initialPathname
                        );

                    }

                    //  -----  si la carga inicial falla, ir a la 404  -----
                    catch (err) {

                        //  -----  registrar el error de la ruta inicial  -----
                        console.error('Error cargando ruta inicial', err);

                        //  -----  notificar el error de la ruta inicial  -----
                        notifyRouteLoadError(undefined, err, 'init');

                        //  -----  cargar la ruta 404  -----
                        await loadNotFoundRoute('init');
                    }
                        
                    //  -----  salir tras arrancar la carga inicial  -----
                    return;
                }

                //  -----  cargar la 404 si la url no está en el manifiesto  -----
                loadNotFoundRoute('init');

                //  -----  dejar el historial en la url actual  -----
                history.replaceState(
                    { id: null, path: initialPath },
                    '',
                    initialPath
                );

            };


            /*
                *  ---------------------  *
                *  -----  EVENTOS  -----  *
                *  ---------------------  *
            */


            /*
                -------------------------------------------------------------------
                -----  Manejadores de navegación  -  clicks  ----------------------
                -----  Enlaces: a[data-id] o a[data-route]  -----------------------
                -------------------------------------------------------------------
            */
            $(document).on('click', 'a[data-id], a[data-route]', async function (event) {

                //  -----  evitar la navegación nativa del enlace  -----
                event.preventDefault();

                /** @type {string|undefined} - `Nombre del archivo de ruta desde data-route` */
                const routeFile = $(this).data('route');

                /** @type {string|undefined} - `ID de la ruta desde el atributo data-id` */
                const dataId = $(this).data('id');

                /** @type {RouteManifest|undefined} - `Entrada del manifest correspondiente al data-id` */
                const entry = dataId ? findManifestEntryById(String(dataId)) : undefined;


                //  -----  ocultar menus tipo navbar compact  -----
                $('.navbar__container').slideUp();

                //  -----  Carga directa por data-route (import dinámico por nombre de archivo)  -----
                if (routeFile) {

                    //  -----  importar y cargar la ruta de data-route  -----
                    try {

                        /** - `Ruta importada desde data-route` */
                        const route = await loadRouteModule(String(routeFile));

                        //  -----  si el módulo no existe, cargar la 404  -----
                        if (!route) {
                            //  -----  cargar la ruta 404  -----
                            await loadNotFoundRoute('click');
                            //  -----  salir de este click  -----
                            return;
                        }

                        //  -----  volcar la ruta del enlace  -----
                        await loadContent(route, 'click');

                    //  -----  si la carga falla, ir a la 404  -----
                    } catch (err) {

                        //  -----  registrar el error del click  -----
                        console.error('Error loadContent (click, data-route):', err);
                        //  -----  notificar el error del click  -----
                        notifyRouteLoadError(undefined, err, 'click');
                        //  -----  cargar la ruta 404  -----
                        await loadNotFoundRoute('click');
                    }

                    //  -----  salir tras la carga por data-route  -----
                    return;
                }

                //  -----  Cargar la ruta por data-id si existe en el manifest  -----
                if (entry) {

                    //  -----  importar y cargar la ruta del manifiesto  -----
                    try {

                        /** - `Ruta importada desde el manifiesto` */
                        const route = await loadRouteModule(entry.file);

                        //  -----  si el módulo no existe, cargar la 404  -----
                        if (!route) {
                            
                            //  -----  cargar la ruta 404  -----
                            await loadNotFoundRoute('click');
                            
                            //  -----  salir de este click  -----
                            return;
                        }

                        //  -----  volcar la ruta del manifiesto  -----
                        await loadContent(route, 'click');
                    
                    } 
                    
                    //  -----  si la carga falla, ir a la 404  -----                    
                    catch (err) {

                        //  -----  registrar el error del click  -----
                        console.error('Error loadContent (click):', err);
                        
                        //  -----  notificar el error del click  -----
                        notifyRouteLoadError(undefined, err, 'click');
                        
                        //  -----  cargar la ruta 404  -----
                        await loadNotFoundRoute('click');
                    }

                }

                //  -----  Si no existe la ruta, cargar la 404  -----
                else
                    //  -----  cargar la 404 si el enlace no está en el manifiesto  -----
                    await loadNotFoundRoute('click');

            });


            /*
                ---------------------------------------------------
                -----  Manejadores de navegación - popstate  -----
                -----  popstate: manejar atrás / adelante  -------
                ---------------------------------------------------
            */
            window.addEventListener('popstate', async (e) => {

                //  -----  Actualizar el favicon inmediatamente (síncronamente) desde el state para evitar parpadeo durante la carga asíncrona (lazy) del módulo de ruta  -----
                if (e.state?.favicon)
                    updateFavicon(e.state.favicon);

                /** @type {string|undefined} - `Nombre del archivo de ruta guardado en el historial` */
                const routeFile = e.state?.routeFile;

                /** @type {string} - `Ruta normalizada desde el state o la URL actual` */
                const raw = e.state?.path ?? window.location.pathname;

                /** @type {RouteManifest|undefined} - `Entrada de manifest para la URL actual` */
                const entry = findManifestEntryByPath(raw);

                //  -----  Importar directamente por routeFile si está en el state (más rápido, usa caché)  -----
                if (routeFile) {

                    //  -----  importar la ruta guardada en el historial  -----
                    try {

                        /** - `Ruta importada desde el historial` */
                        const route = await loadRouteModule(String(routeFile));

                        //  -----  si el módulo no existe, cargar la 404  -----
                        if (!route) {
                            
                            //  -----  cargar la ruta 404  -----
                            await loadNotFoundRoute('popstate');
                            
                            //  -----  salir de este popstate  -----
                            return;
                        }

                        //  -----  volcar la ruta del historial  -----
                        await loadContent(route, 'popstate');
                    
                    } 
                    
                    //  -----  si la carga falla, ir a la 404  -----
                    catch (err) {

                        //  -----  registrar el error del popstate  -----
                        console.error('Error loadContent (popstate, routeFile):', err);
                        //  -----  notificar el error del popstate  -----
                        notifyRouteLoadError(undefined, err, 'popstate');
                        //  -----  cargar la ruta 404  -----
                        await loadNotFoundRoute('popstate');
                    }

                    //  -----  salir tras la carga por routeFile  -----
                    return;
                }


                //  ----- cargamos la ruta SIN empujar otra entrada en el historial  ---------
                //  ----- el navegador ya actualizó la URL y el state al navegar atrás/adelante  -----
                //  ----- pasamos source='popstate' a loadContent para que applyRouteMeta NO haga pushState  -----
                if (entry) {

                    //  -----  importar la ruta de la url actual  -----
                    try {

                        /** - `Ruta importada para atrás o adelante` */
                        const route = await loadRouteModule(entry.file);

                        //  -----  si el módulo no existe, cargar la 404  -----
                        if (!route) {
                            //  -----  cargar la ruta 404  -----
                            await loadNotFoundRoute('popstate');
                            //  -----  salir de este popstate  -----
                            return;
                        }

                        //  -----  volcar la ruta sin empujar historial  -----
                        await loadContent(route, 'popstate');

                    //  -----  si la carga falla, ir a la 404  -----
                    } catch (err) {

                        //  -----  registrar el error del popstate  -----
                        console.error('Error loadContent (popstate):', err);
                        //  -----  notificar el error del popstate  -----
                        notifyRouteLoadError(undefined, err, 'popstate');
                        //  -----  cargar la ruta 404  -----
                        await loadNotFoundRoute('popstate');
                    }
                }

                //  -----  si la url no está en el manifiesto, cargar la 404  -----
                else
                    //  -----  cargar la ruta 404  -----
                    await loadNotFoundRoute('popstate');

            });


            /*
                *  -------------------------------  *
                *  -----  INICIO DEL PLUGIN  -----  *
                *  -------------------------------  *
            */


            //  -----  Mensaje de plugin cargado  -----
            console.log('\n');
            console.log(
                '%c ✅ ✅ ✅ plugin  -  jquery.spa-with-method-load-from-jquery.js  -  versión 5  -  cargado!!! ✅ ✅ ✅', 
                'background:#3498db; color:gold; padding:20px; font-size:20px; font-weight:bold;'
            );
            console.log('\n');


            //  -----  Inicializar la aplicación SPA  -----
            init();


            //*  -----  Retornar this para encadenamiento  -----
            return this;

        };


    })(jQuery);


};
