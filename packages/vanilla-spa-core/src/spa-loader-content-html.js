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
 * - En esta entrega resuelve la ruta inicial, el manifiesto, los imports y la 404.
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

    /** @type {Map<string, VanillaSpaCoreRoute>} - `caché de módulos de ruta ya importados` */
    const routeCache = new Map();

    /** @type {Set<string>} - `módulos de ruta cuyo import() falló` */
    const brokenRouteModules = new Set();



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
     * @param {string} pathname - Pathname crudo.
     * @return {string} - Pathname con una sola barra inicial.
     */
    const collapsePathnameSlashes = (pathname = '') => {

        /** - `pathname en proceso de normalización` */
        let pathnameCollapsed = String(pathname || '');

        //  -----  si el pathname está vacío, devolver la raíz  -----
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
     * - Pathname seguro para `history.pushState`/`replaceState`.
     * @param {string} pathname - Pathname crudo o relativo.
     * @return {string} - Pathname absoluto normalizado.
     */
    const safeHistoryPathname = (pathname = '') => {

        //  -----  resolver el pathname contra el origen actual  -----
        try {

            //  -----  devolver el pathname absoluto  -----
            return new URL(collapsePathnameSlashes(pathname), window.location.origin).pathname;

        }

        //  -----  si la url no es válida, colapsar las barras  -----
        catch (error) {

            //  -----  devolver el pathname colapsado  -----
            return collapsePathnameSlashes(pathname);

        }

    };



    /**
     * -----------------------------------
     * -----  `normalize(raw = '')`  -----
     * -----------------------------------
     * - Normaliza una ruta: quita la base y los slashes de inicio/fin.
     * @param {string} raw - Ruta sin procesar.
     * @return {string} - Ruta normalizada.
     */
    const normalize = (raw = '') => {

        /** - `base de la aplicación` */
        const base = settings.base || '';

        /** - `ruta en proceso de normalización` */
        let normalizedPath = String(raw || '');

        //  -----  colapsar slashes duplicados en pathnames absolutos  -----
        if (normalizedPath.startsWith('/'))
            //  -----  sustituir por la versión colapsada  -----
            normalizedPath = collapsePathnameSlashes(normalizedPath);

        //  -----  quitar la base si está presente  -----
        if (base) {

            /** - `base normalizada sin barra final` */
            const normalizedBase = collapsePathnameSlashes(base).replace(/\/$/, '');

            //  -----  quitar la base ya colapsada  -----
            if (normalizedBase && normalizedPath.startsWith(normalizedBase))
                //  -----  recortar esa base  -----
                normalizedPath = normalizedPath.slice(normalizedBase.length);

            //  -----  si la base aparece tal cual, quitarla  -----
            else if (normalizedPath.startsWith(base))
                //  -----  recortar la base original  -----
                normalizedPath = normalizedPath.slice(base.length);

        }

        //  -----  quitar slashes de inicio y fin  -----
        normalizedPath = normalizedPath.replace(/^\/|\/$/g, '');

        //  -----  devolver la ruta normalizada  -----
        return normalizedPath;

    };



    /**
     * ---------------------------------------------
     * -----  `buildPathname(routePath = '')`  -----
     * ---------------------------------------------
     * - Construye el pathname absoluto de una ruta con la base de la SPA.
     * @param {string} routePath - Ruta relativa de la ruta.
     * @return {string} - Pathname absoluto y normalizado.
     */
    const buildPathname = (routePath = '') => {

        /** - `base de la aplicación sin barra final` */
        const base = (settings.base || '').replace(/\/$/, '');

        /** - `ruta normalizada con barra inicial` */
        const trimmedPath = routePath ? `/${String(routePath).replace(/^\/|\/$/g, '')}` : '';

        /** - `base absoluta con barra inicial` */
        const absoluteBase = base.startsWith('/') ? base : `/${base}`;

        //  -----  construir el pathname absoluto  -----
        try {

            //  -----  devolver el pathname seguro para history  -----
            return safeHistoryPathname(new URL(absoluteBase + trimmedPath, window.location.origin).pathname);

        }

        //  -----  si la url falla, usar el fallback  -----
        catch (error) {

            //  -----  fallback básico con la base y la ruta  -----
            return safeHistoryPathname(absoluteBase + trimmedPath);

        }

    };



    /*
        *  ------------------------------------  *
        *  -----  Manifiesto e imports  -----  *
        *  ------------------------------------  *
    */


    /**
     * ---------------------------------------------------------
     * -----  `findManifestEntryByPath(rawPathname = '')`  -----
     * ---------------------------------------------------------
     * - Busca una entrada del manifiesto por pathname normalizado.
     * @param {string} rawPathname - Pathname crudo.
     * @return {VanillaSpaCoreRouteManifest|undefined} - Entrada del manifiesto.
     */
    const findManifestEntryByPath = (rawPathname = '') => {

        /** - `ruta normalizada para buscar en el manifiesto` */
        const normalizedPath = normalize(rawPathname);

        //  -----  devolver la entrada que coincide  -----
        return (settings.routeManifest || []).find((entry) => normalize(entry.path) === normalizedPath);

    };



    /**
     * ----------------------------------------------
     * -----  `findManifestEntryById(routeId)`  -----
     * ----------------------------------------------
     * - Busca una entrada del manifiesto por id.
     * @param {string} routeId - Id de la ruta.
     * @return {VanillaSpaCoreRouteManifest|undefined} - Entrada del manifiesto.
     */
    const findManifestEntryById = (routeId) => {

        //  -----  devolver la entrada con ese id  -----
        return (settings.routeManifest || []).find((entry) => entry.id === routeId);

    };



    /**
     * ----------------------------------------
     * -----  `loadRouteModule(file)`  -----
     * ----------------------------------------
     * - Importa dinámicamente un módulo de ruta y lo cachea.
     * @param {string} file - Nombre del archivo de ruta sin extensión.
     * @return {Promise<VanillaSpaCoreRoute|undefined>} - Ruta importada.
     */
    const loadRouteModule = async (file) => {

        //  -----  sin archivo no hay ruta que importar  -----
        if (!file)
            //  -----  devolver undefined  -----
            return undefined;

        //  -----  si el módulo ya está en caché, reutilizarlo  -----
        if (routeCache.has(file))
            //  -----  devolver el módulo cacheado  -----
            return routeCache.get(file);

        //  -----  si el módulo ya falló, no reintentar  -----
        if (brokenRouteModules.has(file)) {

            //  -----  avisar de que el módulo roto se omite  -----
            console.warn(`⚠️ Módulo de ruta previamente roto, se omite reimport: ${file}`);

            //  -----  salir sin reimportar  -----
            return undefined;

        }

        //  -----  importar el módulo de ruta  -----
        try {

            /** - `base de módulos sin barra final` */
            const modulesBase = String(settings.routeModulesBase || '').replace(/\/$/, '');

            /** - `URL del módulo de ruta` */
            const moduleUrl = `${modulesBase}/${file}.js`;

            /** @type {Record<string, unknown>} - `módulo ESM importado` */
            const module = await import(moduleUrl);

            /** @type {VanillaSpaCoreRoute|undefined} - `primer export del módulo` */
            const route = /** @type {VanillaSpaCoreRoute|undefined} */ (Object.values(module)[0]);

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
            console.error(`Error importando módulo de ruta: ${file}`, error);

            //  -----  registrar el módulo como roto  -----
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
     * @return {VanillaSpaCoreRouteManifest|undefined} - Entrada 404.
     */
    const findNotFoundRoute = () => {

        //  -----  devolver la entrada 404 del manifiesto  -----
        return (settings.routeManifest || []).find((entry) =>
            entry?.id === '404NotFoundPage' ||
            normalize(entry?.path) === '404' ||
            normalize(entry?.path) === '404-not-found' ||
            /404/i.test(String(entry?.id || ''))
        );

    };



    /**
     * --------------------------------------
     * -----  `loadContent(route)`  -----
     * --------------------------------------
     * - Carga el contenido de una ruta. La inyección real llega en la tarea siguiente.
     * @param {VanillaSpaCoreRoute} route - Ruta a cargar.
     * @return {Promise<void>}
     */
    const loadContent = async (route) => {

        //  -----  avisar que la ruta quedó resuelta  -----
        console.log('-----  ruta lista:', route?.id || '(sin id)', '-----');

    };



    /**
     * -----------------------------------------
     * -----  `loadNotFoundRoute(source)`  -----
     * -----------------------------------------
     * - Carga la ruta 404 si existe.
     * @param {'init'|'click'|'popstate'} source - Origen de la navegación.
     * @return {Promise<VanillaSpaCoreRoute|undefined>} - Ruta 404 cargada.
     */
    const loadNotFoundRoute = async (source) => {

        /** @type {VanillaSpaCoreRouteManifest|undefined} - `entrada 404` */
        const entry404 = findNotFoundRoute();

        //  -----  si no hay ruta 404 configurada, avisar y salir  -----
        if (!entry404) {

            //  -----  registrar que falta la ruta 404  -----
            console.error(`No existe ruta 404 configurada (source: ${source}).`);

            //  -----  devolver undefined  -----
            return undefined;

        }

        /** @type {VanillaSpaCoreRoute|undefined} - `ruta 404 importada` */
        const route404 = await loadRouteModule(entry404.file);

        //  -----  si no se pudo importar la 404, avisar y salir  -----
        if (!route404) {

            //  -----  registrar el fallo al importar la 404  -----
            console.error(`No se pudo importar la ruta 404 (source: ${source}).`);

            //  -----  devolver undefined  -----
            return undefined;

        }

        //  -----  cargar el contenido de la 404  -----
        await loadContent(route404);

        //  -----  devolver la ruta 404 cargada  -----
        return route404;

    };



    /**
     * ----------------------
     * -----  `init()`  -----
     * ----------------------
     * - Inicializa el motor: resuelve la ruta inicial o la 404 y fija el historial.
     * @return {Promise<void>}
     */
    const init = async () => {

        //  -----  en entornos sin window no hay arranque de navegador  -----
        if (typeof window === 'undefined')
            //  -----  salir sin ejecutar el flujo de navegador  -----
            return;

        //  -----  separar el aviso en consola  -----
        console.log('\n');

        //  -----  avisar que el motor vanilla está cargado  -----
        console.warn('-----  vanilla-spa-core cargado  -----');

        //  -----  mostrar cuántas rutas declaró el sitio  -----
        console.log('-----  rutas en el manifiesto:', (settings.routeManifest || []).length, '-----');

        //  -----  separar el aviso en consola  -----
        console.log('\n');

        /** - `pathname actual del navegador, normalizado para history` */
        const initialPath = safeHistoryPathname(window.location.pathname);

        /** @type {VanillaSpaCoreRouteManifest|undefined} - `entrada inicial del manifiesto` */
        const entry = findManifestEntryByPath(initialPath);

        //  -----  si la url inicial está en el manifiesto, cargarla  -----
        if (entry) {

            //  -----  intentar importar y cargar la ruta inicial  -----
            try {

                /** @type {VanillaSpaCoreRoute|undefined} - `ruta inicial` */
                let route = await loadRouteModule(entry.file);

                //  -----  si el módulo existe, cargar su contenido  -----
                if (route)
                    //  -----  volcar la ruta inicial  -----
                    await loadContent(route);

                //  -----  si el módulo no existe, cargar la 404  -----
                else
                    //  -----  cargar la 404 como fallback  -----
                    route = await loadNotFoundRoute('init');

                //  -----  si no hay ruta, dejar el historial en la url actual  -----
                if (!route) {

                    //  -----  reemplazar el state sin ruta  -----
                    history.replaceState({ id: null, path: initialPath }, '', initialPath);

                    //  -----  salir de esta resolución  -----
                    return;

                }

                /** - `pathname inicial normalizado para replaceState` */
                const initialPathname = buildPathname(route.path || entry.path || '');

                //  -----  fijar el state de la ruta inicial  -----
                history.replaceState(
                    { id: route.id, path: initialPathname, routeFile: entry.file, favicon: route.favicon || null },
                    '',
                    initialPathname
                );

            }

            //  -----  si la carga inicial falla, ir a la 404  -----
            catch (error) {

                //  -----  registrar el error de la ruta inicial  -----
                console.error('Error cargando ruta inicial', error);

                //  -----  cargar la ruta 404  -----
                await loadNotFoundRoute('init');

            }

            //  -----  salir tras arrancar la carga inicial  -----
            return;

        }

        //  -----  cargar la 404 si la url no está en el manifiesto  -----
        await loadNotFoundRoute('init');

        //  -----  dejar el historial en la url actual  -----
        history.replaceState({ id: null, path: initialPath }, '', initialPath);

    };



    //  -----  arrancar el motor  -----
    init().catch((error) => {

        //  -----  reportar un fallo no controlado del arranque  -----
        console.error('Error inicializando vanilla-spa-core:', error);

    });

};
