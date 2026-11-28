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

    /** - `clave de cache-busting estable durante toda la sesión` */
    const sessionAssetKey = Date.now();

    /** - `contador de re-evaluación de módulos que renderizan en su nivel superior` */
    let moduleReloadSeq = 0;

    /** - `true si el navegador ya animó la navegación de historial` */
    let hasUAVisualTransition = false;

    /** - `true mientras hay una carga de ruta en curso` */
    let isNavigating = false;

    /** @type {AbortController|null} - `controller de la navegación activa` */
    let activeNavigationAbort = null;

    /** - `true mientras hay una View Transition en curso` */
    let activeViewTransition = false;



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

        /** - `pathname combinado sin doble barra cuando la base es la raíz` */
        const combinedPathname = absoluteBase === '/' ? (trimmedPath || '/') : `${absoluteBase}${trimmedPath}`;

        //  -----  construir el pathname absoluto  -----
        try {

            //  -----  devolver el pathname seguro para history  -----
            return safeHistoryPathname(new URL(combinedPathname, window.location.origin).pathname);

        }

        //  -----  si la url falla, usar el fallback  -----
        catch (error) {

            //  -----  fallback básico con la base y la ruta  -----
            return safeHistoryPathname(combinedPathname);

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
     * -----  `resolveContainer(target)`  -----
     * --------------------------------------
     * - Resuelve un selector CSS o un id pelado a un elemento del DOM.
     * @param {string} target - Selector CSS o id sin `#`.
     * @return {HTMLElement|null} - Elemento encontrado.
     */
    const resolveContainer = (target) => {

        /** - `selector o id recibido` */
        const raw = String(target || '').trim();

        //  -----  sin selector no hay contenedor  -----
        if (!raw)
            //  -----  devolver null  -----
            return null;

        //  -----  si empieza por selector CSS, usar querySelector  -----
        if (/^[.#\[]/.test(raw))
            //  -----  resolver el selector CSS  -----
            return /** @type {HTMLElement|null} */ (document.querySelector(raw));

        //  -----  si es un id pelado, usar getElementById  -----
        return document.getElementById(raw);

    };



    /**
     * -------------------------------------------------------
     * -----  `resolveInjectedAssetUrl(value, baseUrl)`  -----
     * -------------------------------------------------------
     * - Normaliza rutas de recursos dentro del HTML inyectado.
     * @param {string} value - Valor del atributo.
     * @param {string} baseUrl - URL del HTML inyectado.
     * @return {string} - URL del recurso.
     */
    const resolveInjectedAssetUrl = (value, baseUrl) => {

        /** - `valor del atributo recortado` */
        const raw = String(value || '').trim();

        //  -----  ignorar anchors, data URI, protocolos externos y especiales  -----
        if (!raw || /^#|^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(raw) || /^(data|blob|mailto|tel|javascript):/i.test(raw))
            //  -----  devolver el valor original  -----
            return value;

        //  -----  si es ruta absoluta desde raíz, prefijar la base de la SPA  -----
        if (raw.startsWith('/')) {

            /** - `base de la SPA sin barra final` */
            const base = (settings.base || '').replace(/\/$/, '');

            //  -----  si no hay base, dejar la ruta absoluta  -----
            if (!base)
                //  -----  devolver la ruta absoluta  -----
                return raw;

            //  -----  si la ruta ya incluye la base, no duplicarla  -----
            if (raw === base || raw.startsWith(`${base}/`))
                //  -----  devolver la ruta tal cual  -----
                return raw;

            //  -----  anteponer la base de la SPA  -----
            return `${base}${raw}`;

        }

        //  -----  resolver rutas relativas contra la URL del HTML inyectado  -----
        try {

            /** - `URL absoluta del recurso` */
            const resolved = new URL(raw, new URL(baseUrl, window.location.origin));

            //  -----  devolver pathname, búsqueda y hash  -----
            return `${resolved.pathname}${resolved.search}${resolved.hash}`;

        }

        //  -----  si la url relativa no se puede resolver  -----
        catch (error) {

            //  -----  devolver el valor original  -----
            return value;

        }

    };



    /**
     * --------------------------------------------------
     * -----  `rewriteNodeAssetUrls(node, sourceUrl)`  -----
     * --------------------------------------------------
     * - Reescribe `src`, `href`, `poster` y `srcset` de un nodo.
     * @param {Element} node - Nodo del HTML inyectado.
     * @param {string} sourceUrl - URL del HTML de origen.
     * @return {void}
     */
    const rewriteNodeAssetUrls = (node, sourceUrl) => {

        //  -----  reescribir src  -----
        if (node.hasAttribute('src')) {

            /** - `valor actual del src` */
            const src = node.getAttribute('src');

            //  -----  si hay valor, sustituirlo  -----
            if (src)
                //  -----  escribir el src resuelto  -----
                node.setAttribute('src', resolveInjectedAssetUrl(src, sourceUrl));

        }

        //  -----  reescribir href  -----
        if (node.hasAttribute('href')) {

            /** - `valor actual del href` */
            const href = node.getAttribute('href');

            //  -----  si hay valor, sustituirlo  -----
            if (href)
                //  -----  escribir el href resuelto  -----
                node.setAttribute('href', resolveInjectedAssetUrl(href, sourceUrl));

        }

        //  -----  reescribir poster  -----
        if (node.hasAttribute('poster')) {

            /** - `valor actual del poster` */
            const poster = node.getAttribute('poster');

            //  -----  si hay valor, sustituirlo  -----
            if (poster)
                //  -----  escribir el poster resuelto  -----
                node.setAttribute('poster', resolveInjectedAssetUrl(poster, sourceUrl));

        }

        //  -----  reescribir srcset  -----
        if (node.hasAttribute('srcset')) {

            /** - `valor actual del srcset` */
            const srcset = node.getAttribute('srcset');

            //  -----  si hay srcset, normalizar cada candidato  -----
            if (srcset) {

                /** - `srcset con cada URL resuelta` */
                const normalizedSrcset = srcset
                    .split(',')
                    .map((entry) => {

                        /** - `candidato recortado` */
                        const candidate = entry.trim();

                        //  -----  si el candidato está vacío, dejarlo igual  -----
                        if (!candidate)
                            //  -----  devolver el candidato vacío  -----
                            return candidate;

                        /** - `URL y descriptor del candidato` */
                        const [srcCandidate, descriptor] = candidate.split(/\s+/, 2);

                        /** - `URL del candidato resuelta` */
                        const resolvedSrc = resolveInjectedAssetUrl(srcCandidate, sourceUrl);

                        //  -----  devolver la URL con su descriptor  -----
                        return descriptor ? `${resolvedSrc} ${descriptor}` : resolvedSrc;

                    })
                    .join(', ');

                //  -----  escribir el srcset normalizado  -----
                node.setAttribute('srcset', normalizedSrcset);

            }

        }

    };



    /**
     * ------------------------------------------------
     * -----  `parseHtmlFragment(html, sourceUrl)`  -----
     * ------------------------------------------------
     * - Parsea HTML en un documento inerte y devuelve un fragmento con las URLs corregidas.
     * @param {string} html - HTML crudo.
     * @param {string} sourceUrl - URL del HTML de origen.
     * @return {DocumentFragment} - Fragmento listo para insertar.
     */
    const parseHtmlFragment = (html, sourceUrl) => {

        /** - `documento inerte del HTML recibido` */
        const parsed = new DOMParser().parseFromString(String(html || ''), 'text/html');

        //  -----  reescribir las URLs de los nodos inyectados  -----
        parsed.body.querySelectorAll('[src],[href],[poster],[srcset]').forEach((node) => {

            //  -----  reescribir las URLs del nodo  -----
            rewriteNodeAssetUrls(node, sourceUrl);

        });

        /** @type {DocumentFragment} - `fragmento listo para insertar` */
        const fragment = document.createDocumentFragment();

        //  -----  importar cada nodo del body al documento actual  -----
        for (const node of Array.from(parsed.body.childNodes))
            //  -----  clonar el nodo en el documento actual  -----
            fragment.appendChild(document.importNode(node, true));

        //  -----  devolver el fragmento  -----
        return fragment;

    };



    /**
     * --------------------------------------
     * -----  `createErrorFragment(message)`  -----
     * --------------------------------------
     * - Crea un fragmento con el mensaje de error de carga.
     * @param {string} message - Mensaje visible.
     * @return {DocumentFragment} - Fragmento con el párrafo de error.
     */
    const createErrorFragment = (message) => {

        /** @type {HTMLParagraphElement} - `párrafo de error` */
        const paragraph = document.createElement('p');

        //  -----  escribir el mensaje como texto  -----
        paragraph.textContent = message;

        /** @type {DocumentFragment} - `fragmento con el párrafo` */
        const fragment = document.createDocumentFragment();

        //  -----  añadir el párrafo al fragmento  -----
        fragment.appendChild(paragraph);

        //  -----  devolver el fragmento  -----
        return fragment;

    };



    /**
     * ---------------------------------------------
     * -----  `fetchHtmlContent(url, signal)`  -----
     * ---------------------------------------------
     * - Descarga HTML por fetch y lo devuelve como fragmento con URLs reescritas.
     * @param {string} url - URL del archivo HTML.
     * @param {AbortSignal} [signal] - Señal de la navegación.
     * @return {Promise<DocumentFragment>} - Fragmento listo para insertar.
     */
    const fetchHtmlContent = async (url, signal) => {

        //  -----  intentar descargar el HTML  -----
        try {

            /** - `respuesta del fetch` */
            const response = await fetch(url, { signal });

            //  -----  si la respuesta no es OK, lanzar error HTTP  -----
            if (!response.ok)
                //  -----  lanzar el error con el código  -----
                throw new Error(`HTTP ${response.status} ${response.statusText}`);

            /** - `HTML recibido como texto` */
            const html = await response.text();

            //  -----  devolver el HTML parseado y con URLs corregidas  -----
            return parseHtmlFragment(html, url);

        }

        //  -----  si el fetch falla  -----
        catch (error) {

            //  -----  si fue abortado por una nueva navegación, propagar  -----
            if (error instanceof DOMException && error.name === 'AbortError')
                //  -----  propagar el abort  -----
                throw error;

            /** - `true si el error es HTTP, no de red` */
            const isHttpError = error instanceof Error && /^HTTP \d/.test(error.message);

            //  -----  registrar el error de carga  -----
            console.error(`❌ Error al cargar ${url}:`, error);

            //  -----  devolver el fragmento de error  -----
            return createErrorFragment(
                isHttpError
                    ? `${error.message} — No se pudo cargar el contenido.`
                    : `Error de red: no se pudo conectar con ${url}.`
            );

        }

    };



    /**
     * ----------------------------------------------
     * -----  `preloadRouteContent(route, signal)`  -----
     * ----------------------------------------------
     * - Precarga el HTML de components, pagesComponents y MarkdownShikiHtml.
     * @param {VanillaSpaCoreRoute} route - Ruta a precargar.
     * @param {AbortSignal} [signal] - Señal de la navegación.
     * @return {Promise<VanillaSpaCorePreloadPayload>} - Payload listo para inyectar.
     */
    const preloadRouteContent = async (route, signal) => {

        /** @type {VanillaSpaCorePreloadPayload} - `HTML precargado de la ruta` */
        const payload = {
            components: [],
            pageComponents: [],
            markdownShiki: [],
        };



        /**
         * -----------------------------------
         * -----  `preloadComponents()`  -----
         * -----------------------------------
         * - Precarga los componentes del layout.
         * @return {Promise<void>}
         */
        const preloadComponents = async () => {

            //  -----  si la ruta no declara components, avisar y salir  -----
            if (!route.components || Object.keys(route.components).length === 0) {

                //  -----  avisar de que no hay components  -----
                console.warn(`La ruta '${route.id}' no contiene 'components'`);

                //  -----  salir de la precarga  -----
                return;

            }

            /** @type {Promise<void>[]} - `descargas de componentes en curso` */
            const tasks = [];

            //  -----  recorrer cada componente de la ruta  -----
            for (const [selector, url] of Object.entries(route.components)) {

                /** @type {HTMLElement|null} - `contenedor del componente` */
                const el = resolveContainer(selector);

                //  -----  si el contenedor no existe, avisar y omitir  -----
                if (!el) {

                    //  -----  avisar de que falta el contenedor  -----
                    console.warn(`⚠️ Contenedor no encontrado para selector: ${selector} — se omite.`);

                    //  -----  pasar al siguiente componente  -----
                    continue;

                }

                //  -----  si no hay url, marcar el componente para ocultarlo  -----
                if (!url) {

                    //  -----  avisar de que el componente se ocultará  -----
                    console.warn(`⏭️ Componente "${selector}" ignorado (url undefined). Se ocultará.`);

                    //  -----  registrar el componente oculto  -----
                    payload.components.push({ el, hide: true });

                    //  -----  pasar al siguiente componente  -----
                    continue;

                }

                //  -----  precargar el HTML del componente  -----
                tasks.push(
                    fetchHtmlContent(url, signal).then((fragment) => {

                        //  -----  guardar el fragmento del componente  -----
                        payload.components.push({ el, fragment });

                    })
                );

            }

            //  -----  esperar a que terminen todas las descargas  -----
            await Promise.all(tasks);

        };



        /**
         * ----------------------------------------
         * -----  `preloadPageComponents()`  -----
         * ----------------------------------------
         * - Precarga los componentes de la propia página.
         * @return {Promise<void>}
         */
        const preloadPageComponents = async () => {

            //  -----  si no hay pagesComponents, salir  -----
            if (!(route.pagesComponents && Array.isArray(route.pagesComponents)))
                //  -----  salir de la precarga  -----
                return;

            /** @type {Promise<void>[]} - `descargas de page components en curso` */
            const tasks = [];

            //  -----  recorrer cada page component  -----
            for (const entry of route.pagesComponents) {

                /** - `URL del componente de página` */
                const url = entry?.url;

                /** - `selector del contenedor destino` */
                const target = entry?.target;

                //  -----  si falta url o target, omitir la entrada  -----
                if (!url || !target) {

                    //  -----  avisar de que la entrada está incompleta  -----
                    console.warn('⚠️ Entrada pagesComponents incompleta (falta url o target). Se omite.');

                    //  -----  pasar a la siguiente entrada  -----
                    continue;

                }

                //  -----  precargar el HTML del page component  -----
                tasks.push(
                    fetchHtmlContent(url, signal).then((fragment) => {

                        //  -----  guardar el fragmento del page component  -----
                        payload.pageComponents.push({ target, fragment });

                    })
                );

            }

            //  -----  esperar a que terminen todas las descargas  -----
            await Promise.all(tasks);

        };



        /**
         * --------------------------------------
         * -----  `preloadMarkdownShiki()`  -----
         * --------------------------------------
         * - Precarga los bloques HTML de Shiki.
         * @return {Promise<void>}
         */
        const preloadMarkdownShiki = async () => {

            //  -----  si no hay MarkdownShikiHtml, salir  -----
            if (!(route.MarkdownShikiHtml && Array.isArray(route.MarkdownShikiHtml)))
                //  -----  salir de la precarga  -----
                return;

            /** @type {Promise<void>[]} - `descargas de bloques Shiki en curso` */
            const tasks = [];

            //  -----  recorrer cada entrada de Shiki  -----
            for (const entry of route.MarkdownShikiHtml) {

                /** - `nombre del HTML generado` */
                const fileName = entry?.fileName;

                /** - `carpeta de salida del HTML` */
                const urlOutput = entry?.urlOutput;

                /** - `selector del contenedor destino` */
                const target = entry?.target;

                //  -----  si falta algún dato, omitir la entrada  -----
                if (!fileName || !urlOutput || !target)
                    //  -----  pasar a la siguiente entrada  -----
                    continue;

                /** - `URL final del bloque Shiki` */
                const url = `${urlOutput}/${fileName}`;

                //  -----  precargar el HTML del bloque Shiki  -----
                tasks.push(
                    fetchHtmlContent(url, signal).then((fragment) => {

                        //  -----  guardar el fragmento Shiki  -----
                        payload.markdownShiki.push({ target, fragment });

                    })
                );

            }

            //  -----  esperar a que terminen todas las descargas  -----
            await Promise.all(tasks);

        };



        //  -----  precargar los tres grupos en paralelo  -----
        await Promise.all([
            preloadComponents(),
            preloadPageComponents(),
            preloadMarkdownShiki(),
        ]);

        //  -----  devolver el payload  -----
        return payload;

    };



    /** - `clave de cache-busting estable durante toda la sesión para el favicon` */
    const faviconSessionKey = Date.now();



    /*
        *  ---------------------------  *
        *  -----  EVENTOS spa:*  -----  *
        *  ---------------------------  *
    */


    /**
     * ------------------------------------
     * -----  `notifyRouteLoaded(route)`  -----
     * ------------------------------------
     * - Emite `spa:route-loaded` y, la primera vez, `spa:first-route-loaded`.
     * @param {VanillaSpaCoreRoute} route - Ruta que terminó de renderizarse.
     * @return {void}
     */
    const notifyRouteLoaded = (route) => {

        //  -----  emitir el evento de ruta cargada  -----
        document.dispatchEvent(
            new CustomEvent('spa:route-loaded', {
                detail: {
                    route: {
                        id: route?.id || null,
                        path: route?.path || window.location.pathname,
                    },
                },
            })
        );

        //  -----  si es la primera ruta de la sesión  -----
        if (!window.__spaFirstRouteLoaded) {

            //  -----  marcar la primera ruta como cargada  -----
            window.__spaFirstRouteLoaded = true;

            //  -----  emitir el evento de primera ruta  -----
            document.dispatchEvent(new CustomEvent('spa:first-route-loaded'));

        }

    };



    /**
     * ------------------------------------------------------
     * -----  `notifyRouteLoadError(route, error, source)`  -----
     * ------------------------------------------------------
     * - Emite `spa:route-load-error` y desbloquea el loader inicial si hace falta.
     * @param {VanillaSpaCoreRoute|undefined} route - Ruta que falló.
     * @param {unknown} error - Error de la carga.
     * @param {string} source - Origen del fallo.
     * @return {void}
     */
    const notifyRouteLoadError = (route, error, source) => {

        //  -----  registrar el error en consola  -----
        console.error('Error cargando ruta SPA:', error);

        //  -----  emitir el evento de error  -----
        document.dispatchEvent(
            new CustomEvent('spa:route-load-error', {
                detail: {
                    id: route?.id || null,
                    path: route?.path || window.location.pathname,
                    source,
                    message: error instanceof Error ? error.message : String(error || 'Error desconocido'),
                },
            })
        );

        //  -----  si aún no se cargó la primera ruta  -----
        if (!window.__spaFirstRouteLoaded) {

            //  -----  marcar la primera ruta como resuelta  -----
            window.__spaFirstRouteLoaded = true;

            //  -----  emitir el evento para soltar el loader  -----
            document.dispatchEvent(new CustomEvent('spa:first-route-loaded'));

        }

    };



    /*
        *  ----------------------------------------  *
        *  -----  Metadatos de la ruta  ----------  *
        *  ----------------------------------------  *
    */


    /**
     * --------------------------------------
     * -----  `updateFavicon(favicon)`  -----
     * --------------------------------------
     * - Actualiza el favicon del documento sin parpadeo.
     * @param {string} favicon - URL del favicon.
     * @return {void}
     */
    const updateFavicon = (favicon) => {

        /** - `URL absoluta del favicon` */
        const newAbsolute = new URL(favicon, document.baseURI).href;

        /** - `URL del favicon con cache-busting` */
        const newHref = `${favicon}?v=${faviconSessionKey}`;

        /** @type {HTMLLinkElement|null} - `favicon existente` */
        const existing = /** @type {HTMLLinkElement|null} */ (document.querySelector('link[rel~="icon"]'));

        //  -----  si ya existe un favicon, actualizarlo in-place  -----
        if (existing) {

            //  -----  si el archivo es el mismo, no hacer nada  -----
            if (existing.href.split('?')[0] === newAbsolute)
                //  -----  salir sin parpadeo  -----
                return;

            //  -----  actualizar el href sin quitar el nodo  -----
            existing.href = newHref;

            //  -----  eliminar favicons duplicados  -----
            document.querySelectorAll('link[rel~="icon"]').forEach((link) => {

                //  -----  conservar solo el favicon actualizado  -----
                if (link !== existing)
                    //  -----  quitar el duplicado  -----
                    link.remove();

            });

            //  -----  salir tras actualizar  -----
            return;

        }

        //  -----  crear el favicon si no existe  -----
        /** @type {HTMLLinkElement} - `nuevo favicon` */
        const link = document.createElement('link');

        //  -----  configurar el favicon  -----
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = newHref;

        //  -----  añadirlo al head  -----
        document.head.appendChild(link);

    };



    /**
     * -------------------------------------------
     * -----  `addTitleHeaderFooter(title)`  -----
     * -------------------------------------------
     * - Escribe el título en el header y el footer del layout.
     * @param {string} title - Título de la ruta.
     * @return {void}
     */
    const addTitleHeaderFooter = (title) => {

        /** @type {HTMLElement|null} - `título del header` */
        const headerTitle = /** @type {HTMLElement|null} */ (document.querySelector('#layoutHeader #headerTitle'));

        //  -----  si existe el título del header, escribirlo  -----
        if (headerTitle)
            //  -----  escribir el texto  -----
            headerTitle.textContent = title;

        /** @type {HTMLElement|null} - `título del footer` */
        const footerTitle = /** @type {HTMLElement|null} */ (document.querySelector('#layoutFooter #footerTitle'));

        //  -----  si existe el título del footer, escribirlo  -----
        if (footerTitle)
            //  -----  escribir el texto  -----
            footerTitle.textContent = title;

    };



    /**
     * ---------------------------------------------
     * -----  `loadStylesheetsByPage(styles)`  -----
     * ---------------------------------------------
     * - Carga las hojas de estilo de la ruta y elimina las anteriores.
     * @param {VanillaSpaCoreRouteStyle[]|null|undefined} styles - Hojas de la ruta.
     * @return {void}
     */
    const loadStylesheetsByPage = (styles) => {

        //  -----  eliminar las hojas de la ruta anterior  -----
        document.querySelectorAll('link[data-page-style="true"]').forEach((link) => link.remove());

        //  -----  si no hay estilos, salir  -----
        if (!styles || !Array.isArray(styles))
            //  -----  no hay hojas que cargar  -----
            return;

        //  -----  insertar las nuevas hojas  -----
        for (const style of styles) {

            //  -----  si la entrada no tiene href, omitirla  -----
            if (!style || !style.href)
                //  -----  pasar a la siguiente hoja  -----
                continue;

            /** @type {HTMLLinkElement} - `nueva hoja de estilo` */
            const link = document.createElement('link');

            //  -----  configurar la hoja con cache-busting  -----
            link.rel = 'stylesheet';
            link.href = `${style.href}?t=${sessionAssetKey}`;
            link.dataset.pageStyle = 'true';

            //  -----  añadirla al head  -----
            document.head.appendChild(link);

        }

    };



    /**
     * ------------------------------------------------
     * -----  `applyRouteMetaSync(route, source)`  -----
     * ------------------------------------------------
     * - Aplica los metadatos síncronos de la ruta y empuja historial en un clic.
     * @param {VanillaSpaCoreRoute} route - Ruta actual.
     * @param {'init'|'click'|'popstate'} [source='click'] - Origen de la navegación.
     * @return {void}
     */
    const applyRouteMetaSync = (route, source = 'click') => {

        //  -----  actualizar el título de la pestaña  -----
        if (route.pageTitle)
            //  -----  escribir el título  -----
            document.title = route.pageTitle;

        //  -----  actualizar el favicon  -----
        if (route.favicon)
            //  -----  cambiar el favicon  -----
            updateFavicon(route.favicon);

        //  -----  actualizar el header y el footer  -----
        if (route.headerTitle)
            //  -----  escribir el título en el layout  -----
            addTitleHeaderFooter(route.headerTitle);

        //  -----  actualizar las hojas de estilo (quita las anteriores si no hay)  -----
        loadStylesheetsByPage(route.styles);

        /** - `nuevo pathname de la ruta` */
        const newPathname = buildPathname(route.path || '');

        /**
         * - `Compara pathnames ignorando la barra final.`
         * @param {string} pathname - Pathname a normalizar.
         * @return {string} - Pathname sin barra final.
         */
        const stripTrailingSlash = (pathname) => {

            /** - `pathname sin la barra final` */
            const stripped = String(pathname || '').replace(/\/$/, '');

            //  -----  devolver la raíz si queda vacío  -----
            return stripped === '' ? '/' : stripped;

        };

        //  -----  solo un clic empuja historial; init y popstate no  -----
        if (source === 'click' && stripTrailingSlash(safeHistoryPathname(window.location.pathname)) !== stripTrailingSlash(newPathname)) {

            /** @type {VanillaSpaCoreRouteManifest|undefined} - `entrada del manifiesto` */
            const manifestEntry = findManifestEntryById(route.id);

            //  -----  empujar la nueva ruta al historial  -----
            history.pushState(
                {
                    id: route.id,
                    path: newPathname,
                    routeFile: manifestEntry?.file || null,
                    favicon: route.favicon || null,
                },
                '',
                newPathname
            );

            //  -----  separar el aviso en consola  -----
            console.log('\n');

            //  -----  avisar de la navegación  -----
            console.warn('navigate ==>', route.id, newPathname);

            //  -----  separar el aviso en consola  -----
            console.log('\n');

        }

    };



    /*
        *  -------------------------------------  *
        *  -----  Navbar y animaciones  -----  *
        *  -------------------------------------  *
    */


    /**
     * ------------------------------------------------
     * -----  `slideDown(element, duration = 300)`  -----
     * ------------------------------------------------
     * - Despliega un elemento con una animación de margen.
     * @param {HTMLElement} element - Elemento a mostrar.
     * @param {number} [duration=300] - Duración en milisegundos.
     * @return {void}
     */
    const slideDown = (element, duration = 300) => {

        //  -----  si el elemento ya es visible, no hacer nada  -----
        if (window.getComputedStyle(element).display !== 'none')
            //  -----  salir  -----
            return;

        //  -----  restaurar el display para calcular la altura  -----
        element.style.removeProperty('display');

        /** - `display calculado del elemento` */
        let display = window.getComputedStyle(element).display;

        //  -----  si el display es none, usar flex  -----
        if (display === 'none')
            //  -----  usar flex como display visible  -----
            display = 'flex';

        //  -----  preparar la animación de entrada  -----
        element.style.display = display;
        element.style.marginTop = '-100%';
        element.style.transitionProperty = 'margin-top';
        element.style.transitionDuration = `${duration}ms`;
        element.style.transitionTimingFunction = 'cubic-bezier(0.22, 1, 0.36, 1)';
        element.style.willChange = 'margin-top';

        //  -----  forzar reflow antes de animar  -----
        element.offsetHeight;

        //  -----  animar el margen a cero  -----
        requestAnimationFrame(() => {

            //  -----  llevar el margen a su posición final  -----
            element.style.marginTop = '0';

        });

        //  -----  limpiar los estilos de transición al terminar  -----
        setTimeout(() => {

            //  -----  quitar la duración  -----
            element.style.removeProperty('transition-duration');

            //  -----  quitar la propiedad animada  -----
            element.style.removeProperty('transition-property');

            //  -----  quitar la función de timing  -----
            element.style.removeProperty('transition-timing-function');

            //  -----  quitar will-change  -----
            element.style.removeProperty('will-change');

        }, duration);

    };



    /**
     * ----------------------------------------------
     * -----  `slideUp(element, duration = 300)`  -----
     * ----------------------------------------------
     * - Oculta un elemento con una animación de margen.
     * @param {HTMLElement} element - Elemento a ocultar.
     * @param {number} [duration=300] - Duración en milisegundos.
     * @return {void}
     */
    const slideUp = (element, duration = 300) => {

        //  -----  si el elemento ya está oculto, no hacer nada  -----
        if (window.getComputedStyle(element).display === 'none')
            //  -----  salir  -----
            return;

        //  -----  preparar la animación de salida  -----
        element.style.transitionProperty = 'margin-top';
        element.style.transitionDuration = `${duration}ms`;
        element.style.transitionTimingFunction = 'cubic-bezier(0.4, 0, 1, 1)';
        element.style.willChange = 'margin-top';

        //  -----  forzar reflow antes de animar  -----
        element.offsetHeight;

        //  -----  animar el margen fuera de la vista  -----
        requestAnimationFrame(() => {

            //  -----  llevar el margen a -100%  -----
            element.style.marginTop = '-100%';

        });

        //  -----  ocultar y limpiar los estilos al terminar  -----
        setTimeout(() => {

            //  -----  ocultar el elemento  -----
            element.style.display = 'none';

            //  -----  quitar la duración  -----
            element.style.removeProperty('transition-duration');

            //  -----  quitar la propiedad animada  -----
            element.style.removeProperty('transition-property');

            //  -----  quitar la función de timing  -----
            element.style.removeProperty('transition-timing-function');

            //  -----  quitar will-change  -----
            element.style.removeProperty('will-change');

        }, duration);

    };



    /**
     * -------------------------------
     * -----  `actionsNavbar()`  -----
     * -------------------------------
     * - Abre y cierra el menú del navbar y lo cierra al hacer clic fuera.
     * @return {void}
     */
    const actionsNavbar = () => {

        /** - `duración de la apertura del menú` */
        const openDuration = 560;

        /** - `duración del cierre del menú` */
        const closeDuration = 360;

        /** @type {HTMLElement|null} - `contenedor del navbar` */
        const navbar = /** @type {HTMLElement|null} */ (document.querySelector('.navbar__container'));

        //  -----  si no hay navbar, lanzar error controlado  -----
        if (!navbar)
            //  -----  avisar de que falta el navbar  -----
            throw new Error('❌ No se encontró el elemento .navbar__container');

        /** @type {HTMLElement|null} - `botón de abrir menú` */
        const btnOpen = /** @type {HTMLElement|null} */ (document.querySelector('.navbar__btn-open'));

        //  -----  si no hay botón de abrir, lanzar error controlado  -----
        if (!btnOpen)
            //  -----  avisar de que falta el botón  -----
            throw new Error('❌ No se encontró el elemento .navbar__btn-open');

        /** @type {HTMLElement|null} - `botón de cerrar menú` */
        const btnClose = /** @type {HTMLElement|null} */ (document.querySelector('.navbar__btn-close'));

        //  -----  si no hay botón de cerrar, lanzar error controlado  -----
        if (!btnClose)
            //  -----  avisar de que falta el botón  -----
            throw new Error('❌ No se encontró el elemento .navbar__btn-close');

        //  -----  estado inicial  -----
        navbar.style.display = 'none';
        btnClose.style.display = 'none';



        /**
         * -------------------------------
         * -----  `lockBodyScroll()`  -----
         * -------------------------------
         * - Bloquea el scroll del body con el menú abierto.
         * @return {void}
         */
        const lockBodyScroll = () => {

            //  -----  bloquear el scroll  -----
            document.body.style.overflow = 'hidden';

        };



        /**
         * ---------------------------------
         * -----  `unlockBodyScroll()`  -----
         * ---------------------------------
         * - Restaura el scroll del body.
         * @return {void}
         */
        const unlockBodyScroll = () => {

            //  -----  quitar el bloqueo  -----
            document.body.style.removeProperty('overflow');

        };

        /** @type {HTMLElement} - `botón de abrir clonado` */
        const newBtnOpen = /** @type {HTMLElement} */ (btnOpen.cloneNode(true));

        //  -----  reemplazar el botón para limpiar listeners previos  -----
        btnOpen.parentNode?.replaceChild(newBtnOpen, btnOpen);

        /** @type {HTMLElement} - `botón de cerrar clonado` */
        const newBtnClose = /** @type {HTMLElement} */ (btnClose.cloneNode(true));

        //  -----  reemplazar el botón para limpiar listeners previos  -----
        btnClose.parentNode?.replaceChild(newBtnClose, btnClose);

        //  -----  abrir el menú  -----
        newBtnOpen.addEventListener('click', (event) => {

            //  -----  evitar que el clic cierre el menú  -----
            event.stopPropagation();

            //  -----  ocultar abrir y mostrar cerrar  -----
            newBtnOpen.style.display = 'none';
            newBtnClose.style.display = 'flex';

            //  -----  bloquear el scroll  -----
            lockBodyScroll();

            //  -----  desplegar el navbar  -----
            slideDown(navbar, openDuration);

        });

        //  -----  cerrar el menú  -----
        newBtnClose.addEventListener('click', (event) => {

            //  -----  evitar que el clic cierre el menú  -----
            event.stopPropagation();

            //  -----  ocultar cerrar y mostrar abrir  -----
            newBtnClose.style.display = 'none';
            newBtnOpen.style.display = 'flex';

            //  -----  plegar el navbar  -----
            slideUp(navbar, closeDuration);

            //  -----  desbloquear el scroll  -----
            unlockBodyScroll();

        });

        //  -----  cerrar el menú al hacer clic fuera, una sola vez  -----
        if (!document.body.dataset._spaClickBound) {

            //  -----  listener global de cierre  -----
            document.addEventListener('click', () => {

                /** @type {HTMLElement|null} - `navbar actual` */
                const currentNavbar = /** @type {HTMLElement|null} */ (document.querySelector('.navbar__container'));

                //  -----  si la vista no tiene navbar, no hacer nada  -----
                if (!currentNavbar)
                    //  -----  salir  -----
                    return;

                /** @type {HTMLElement|null} - `botón de cerrar actual` */
                const currentBtnClose = /** @type {HTMLElement|null} */ (document.querySelector('.navbar__btn-close'));

                /** @type {HTMLElement|null} - `botón de abrir actual` */
                const currentBtnOpen = /** @type {HTMLElement|null} */ (document.querySelector('.navbar__btn-open'));

                //  -----  proteger el cierre del menú  -----
                try {

                    //  -----  plegar el navbar  -----
                    slideUp(currentNavbar, closeDuration);

                    //  -----  ocultar cerrar si existe  -----
                    if (currentBtnClose)
                        //  -----  ocultar el botón  -----
                        currentBtnClose.style.display = 'none';

                    //  -----  mostrar abrir si existe  -----
                    if (currentBtnOpen)
                        //  -----  mostrar el botón  -----
                        currentBtnOpen.style.display = 'flex';

                    //  -----  desbloquear el scroll  -----
                    unlockBodyScroll();

                }

                //  -----  si el cierre falla, avisar sin romper  -----
                catch (error) {

                    //  -----  registrar el fallo  -----
                    console.warn('⚠️ No se pudo cerrar el menú al hacer clic fuera:', error);

                }

            });

            //  -----  marcar el listener como instalado  -----
            document.body.dataset._spaClickBound = '1';

        }

    };



    /**
     * ---------------------------------------------------------
     * -----  `applyPreloadedContent(payload, route, source)`  -----
     * ---------------------------------------------------------
     * - Inyecta el HTML precargado en el DOM de forma síncrona.
     * @param {VanillaSpaCorePreloadPayload} payload - Contenido precargado.
     * @param {VanillaSpaCoreRoute} route - Ruta actual.
     * @param {'init'|'click'|'popstate'} [source='click'] - Origen de la navegación.
     * @return {void}
     */
    const applyPreloadedContent = (payload, route, source = 'click') => {

        //  -----  si la ruta no tiene components, avisar y salir  -----
        if (!route.components || Object.keys(route.components).length === 0) {

            //  -----  avisar de que no hay components  -----
            console.warn(`applyPreloadedContent: la ruta ${route.id} no tiene 'components'`);

            //  -----  aplicar los metadatos de la ruta  -----
            applyRouteMetaSync(route, source);

            //  -----  salir sin inyectar  -----
            return;

        }

        //  -----  inyectar los componentes del layout  -----
        for (const item of payload.components) {

            //  -----  si el componente va oculto, vaciar el contenedor  -----
            if ('hide' in item) {

                //  -----  ocultar el contenedor  -----
                item.el.style.display = 'none';

                //  -----  vaciar el contenedor  -----
                item.el.replaceChildren();

                //  -----  pasar al siguiente componente  -----
                continue;

            }

            //  -----  restaurar la visibilidad del contenedor  -----
            item.el.style.display = '';

            //  -----  volcar el fragmento del componente  -----
            item.el.replaceChildren(item.fragment);

        }

        //  -----  inicializar las acciones del navbar  -----
        try {

            //  -----  enlazar abrir, cerrar y clic fuera  -----
            actionsNavbar();

        }

        //  -----  si el navbar no está en la vista, seguir  -----
        catch (error) {

            //  -----  avisar de que el navbar no se pudo iniciar  -----
            console.warn('actionsNavbar falló (probablemente falta .navbar__container en la vista):', error);

        }

        //  -----  inyectar los page components  -----
        for (const { target, fragment } of payload.pageComponents) {

            /** @type {HTMLElement|null} - `contenedor del page component` */
            const container = resolveContainer(target);

            //  -----  si el contenedor no existe, avisar y omitir  -----
            if (!container) {

                //  -----  avisar de que falta el contenedor  -----
                console.warn(`⚠️ Contenedor no encontrado para pageComponent: ${target} — se omite.`);

                //  -----  pasar al siguiente page component  -----
                continue;

            }

            //  -----  restaurar la visibilidad del contenedor  -----
            container.style.display = '';

            //  -----  volcar el fragmento del page component  -----
            container.replaceChildren(fragment);

        }

        //  -----  inyectar los bloques Shiki  -----
        for (const { target, fragment } of payload.markdownShiki) {

            /** @type {HTMLElement|null} - `contenedor del bloque Shiki` */
            const container = resolveContainer(target);

            //  -----  si el contenedor no existe, avisar y omitir  -----
            if (!container) {

                //  -----  avisar de que falta el contenedor  -----
                console.warn(`⚠️ Contenedor no encontrado para Markdown Shiki: ${target} — se omite.`);

                //  -----  pasar al siguiente bloque  -----
                continue;

            }

            //  -----  volcar el fragmento del bloque Shiki  -----
            container.replaceChildren(fragment);

        }

        //  -----  aplicar los metadatos de la ruta  -----
        applyRouteMetaSync(route, source);

    };



    /*
        *  ---------------------  *
        *  -----  SCRIPTS  -----  *
        *  ---------------------  *
    */


    /**
     * ------------------------------------------------------
     * -----  `scriptSrcMatches(loadedSrc, targetSrc)`  -----
     * ------------------------------------------------------
     * - Compara dos URLs de script ignorando la querystring.
     * @param {string} loadedSrc - URL absoluta del script en el DOM.
     * @param {string} targetSrc - URL del script de la ruta.
     * @return {boolean} - `true si coinciden`.
     */
    const scriptSrcMatches = (loadedSrc, targetSrc) => {

        /** - `URL cargada sin querystring` */
        const loaded = String(loadedSrc || '').split('?')[0];

        /** - `URL objetivo sin querystring` */
        const target = String(targetSrc || '').split('?')[0];

        //  -----  comparar por sufijo o inclusión  -----
        return loaded.endsWith(target) || loaded.includes(target);

    };



    /**
     * -----------------------------------
     * -----  `isScriptLoaded(src)`  -----
     * -----------------------------------
     * - Comprueba si un script ya está cargado en el documento.
     * @param {string} src - URL del script.
     * @return {boolean} - `true si ya está cargado`.
     */
    const isScriptLoaded = (src) => {

        //  -----  proteger la comprobación  -----
        try {

            /** @type {HTMLScriptElement[]} - `scripts del documento` */
            const scripts = Array.from(document.scripts);

            //  -----  buscar una coincidencia sin querystring  -----
            return scripts.some((script) => script.src && scriptSrcMatches(script.src, src));

        }

        //  -----  si la comprobación falla, tratarlo como no cargado  -----
        catch (error) {

            //  -----  devolver false  -----
            return false;

        }

    };



    /**
     * ----------------------------------------
     * -----  `removeLoadedScripts(src)`  -----
     * ----------------------------------------
     * - Elimina del DOM los `<script>` que coinciden con la URL.
     * @param {string} src - URL del script.
     * @return {void}
     */
    const removeLoadedScripts = (src) => {

        //  -----  proteger la eliminación  -----
        try {

            //  -----  eliminar los scripts que coinciden  -----
            Array.from(document.scripts)
                .filter((script) => script.src && scriptSrcMatches(script.src, src))
                .forEach((script) => script.remove());

        }

        //  -----  ignorar errores de eliminación  -----
        catch (error) {

            //  -----  no romper el flujo global  -----
            return;

        }

    };



    /**
     * --------------------------------
     * -----  `loadScripts(script)`  -----
     * --------------------------------
     * - Carga un script de la ruta como clásico o como módulo ES6.
     * - Acepta `type: 'module'` y el alias `isModule: true` de la referencia.
     * @param {VanillaSpaCoreRouteScript} script - Script de la ruta.
     * @return {Promise<void>}
     */
    const loadScripts = async (script) => {

        /** - `URL del script` */
        const src = script?.src;

        /** - `true si el script es un módulo ES6` */
        const isModule = script?.type === 'module' || script?.isModule === true;

        /** - `función exportada a ejecutar tras importar el módulo` */
        const exportFunctionName = script?.exportFunctionName || null;

        //  -----  sin src no hay script que cargar  -----
        if (!src)
            //  -----  salir  -----
            return;

        //  -----  scripts clásicos: re-ejecutar al volver a la ruta  -----
        if (!isModule && isScriptLoaded(src)) {

            //  -----  quitar el script anterior  -----
            removeLoadedScripts(src);

            //  -----  avisar de la re-ejecución  -----
            console.log(`🔄 Script clásico re-ejecutado: ${src}`);

        }

        //  -----  módulos ya cargados: no reimportar sin necesidad  -----
        else if (isModule && isScriptLoaded(src)) {

            //  -----  avisar de que ya está cargado  -----
            console.log(`🔁 Script ya cargado: ${src}`);

            //  -----  salir  -----
            return;

        }

        /** - `URL con cache-busting estable por sesión` */
        const urlWithCacheBypass = `${src}?v=${sessionAssetKey}`;

        //  -----  cargar como módulo ES6  -----
        if (isModule) {

            //  -----  URL estable si hay función de montaje; única si renderiza en top-level  -----
            const moduleUrl = exportFunctionName
                ? `${src}?v=${sessionAssetKey}`
                : `${src}?m=${sessionAssetKey}.${++moduleReloadSeq}`;

            //  -----  importar el módulo  -----
            try {

                /** @type {Record<string, unknown>} - `módulo importado` */
                const module = await import(moduleUrl);

                //  -----  avisar de la importación  -----
                console.log(`✅ Módulo importado: ${moduleUrl}`);

                //  -----  si hay función exportada, ejecutarla  -----
                if (exportFunctionName) {

                    /** - `función exportada del módulo` */
                    const exported = module[exportFunctionName];

                    //  -----  si la exportación es una función, ejecutarla  -----
                    if (typeof exported === 'function')
                        //  -----  ejecutar el montaje del módulo  -----
                        exported();

                }

            }

            //  -----  si el import falla, reportarlo sin romper el flujo  -----
            catch (error) {

                //  -----  registrar el error del módulo  -----
                console.error(`❌ Error cargando el módulo: ${src}`, error);

            }

            //  -----  salir de la carga de módulo  -----
            return;

        }

        //  -----  cargar como script clásico  -----
        await new Promise((resolve) => {

            /** @type {HTMLScriptElement} - `elemento script` */
            const scriptElement = document.createElement('script');

            //  -----  configurar la URL con cache-busting  -----
            scriptElement.src = urlWithCacheBypass;

            //  -----  cargar de forma asíncrona  -----
            scriptElement.async = true;

            //  -----  resolver cuando el script termine de cargar  -----
            scriptElement.onload = () => {

                //  -----  avisar de la carga  -----
                console.log(`✅ Script cargado: ${urlWithCacheBypass}`);

                //  -----  resolver la promesa  -----
                resolve(undefined);

            };

            //  -----  resolver con error para no bloquear el loader  -----
            scriptElement.onerror = (error) => {

                //  -----  registrar el error  -----
                console.error(`❌ Error al cargar: ${urlWithCacheBypass}`, error);

                //  -----  resolver igualmente  -----
                resolve(undefined);

            };

            //  -----  añadir el script al head  -----
            document.head.appendChild(scriptElement);

        });

    };



    /**
     * ----------------------------------------------
     * -----  `applyRouteMetaAsync(route, signal)`  -----
     * ----------------------------------------------
     * - Carga los scripts de la ruta en orden después de inyectar el DOM.
     * - `route.libs` es jQuery-only; el motor vanilla lo ignora (spec futura).
     * @param {VanillaSpaCoreRoute} route - Ruta actual.
     * @param {AbortSignal} [signal] - Señal de la navegación.
     * @return {Promise<void>}
     */
    const applyRouteMetaAsync = async (route, signal) => {

        //  -----  si la ruta no declara scripts, salir  -----
        if (!route.scripts)
            //  -----  no hay scripts que cargar  -----
            return;

        //  -----  cargar cada script de forma secuencial  -----
        for (const script of route.scripts) {

            //  -----  si la navegación fue abortada, detener la carga  -----
            if (signal?.aborted)
                //  -----  lanzar el aborto  -----
                throw new DOMException('Navegación abortada por una navegación más nueva', 'AbortError');

            //  -----  cargar el script de la ruta  -----
            await loadScripts(script);

        }

        //  -----  comprobar si la navegación quedó obsoleta tras el último script  -----
        if (signal?.aborted)
            //  -----  lanzar el aborto  -----
            throw new DOMException('Navegación abortada por una navegación más nueva', 'AbortError');

    };



    /**
     * ------------------------------------------------
     * -----  `loadContent(route, source = 'click')`  -----
     * ------------------------------------------------
     * - Carga una ruta en 3 fases: precarga, mutación y scripts.
     * - Aborta la navegación anterior y descarta la obsoleta.
     * @param {VanillaSpaCoreRoute} route - Ruta a cargar.
     * @param {'init'|'click'|'popstate'} [source='click'] - Origen de la navegación.
     * @return {Promise<void>}
     */
    const loadContent = async (route, source = 'click') => {

        //  -----  consumir el flag de transición visual del navegador  -----
        const skipViewTransition = hasUAVisualTransition;

        //  -----  resetear el flag para la siguiente navegación  -----
        hasUAVisualTransition = false;

        //  -----  si hay una navegación en curso, abortarla  -----
        if (isNavigating && activeNavigationAbort)
            //  -----  abortar la navegación anterior  -----
            activeNavigationAbort.abort();

        /** @type {AbortController} - `controller de esta navegación` */
        const controller = new AbortController();

        //  -----  marcar el controller como activo  -----
        activeNavigationAbort = controller;

        /** @type {AbortSignal} - `señal de esta navegación` */
        const signal = controller.signal;

        //  -----  marcar que hay una navegación en curso  -----
        isNavigating = true;

        //  -----  intentar cargar la ruta  -----
        try {

            //  -----  validar la ruta  -----
            if (!route)
                //  -----  lanzar error por ruta inválida  -----
                throw new Error('Ruta inválida');

            //  -----  FASE 1: precargar el HTML de la ruta  -----
            const payload = await preloadRouteContent(route, signal);

            //  -----  si la navegación fue abortada, descartar  -----
            if (signal.aborted)
                //  -----  salir sin mutar el DOM  -----
                return;

            /**
             * ------------------------
             * -----  `mutate()`  -----
             * ------------------------
             * - Aplica el contenido precargado de forma síncrona.
             * @return {void}
             */
            const mutate = () => applyPreloadedContent(payload, route, source);

            //  -----  FASE 2: mutar el DOM dentro de la View Transition  -----
            if (document.startViewTransition && !activeViewTransition && !skipViewTransition) {

                //  -----  marcar la transición como activa  -----
                activeViewTransition = true;

                /** - `View Transition de esta navegación` */
                const viewTransition = document.startViewTransition(() => mutate());

                //  -----  esperar solo a que el DOM quede mutado  -----
                await viewTransition.updateCallbackDone.catch(() => {

                    //  -----  ignorar el rechazo de la transición  -----
                    return undefined;

                });

                //  -----  liberar la transición cuando termine la animación  -----
                viewTransition.finished
                    .catch(() => {

                        //  -----  ignorar el rechazo de la animación  -----
                        return undefined;

                    })
                    .finally(() => {

                        //  -----  permitir la próxima transición  -----
                        activeViewTransition = false;

                    });

            }

            //  -----  sin View Transitions, mutar directamente  -----
            else {

                //  -----  aplicar el contenido  -----
                mutate();

            }

            //  -----  si la navegación fue abortada, descartar la fase 3  -----
            if (signal.aborted)
                //  -----  salir sin cargar scripts  -----
                return;

            //  -----  FASE 3: cargar scripts con el DOM ya mutado  -----
            await applyRouteMetaAsync(route, signal);

            //  -----  si la navegación quedó obsoleta, no notificar  -----
            if (signal.aborted)
                //  -----  salir sin notificar  -----
                return;

            //  -----  notificar que la ruta terminó de renderizarse  -----
            notifyRouteLoaded(route);

            //  -----  avisar que la ruta quedó inyectada  -----
            console.log('-----  ruta lista:', route.id, '-----');

        }

        //  -----  si la carga falla  -----
        catch (error) {

            //  -----  si es un aborto intencional, no notificar error  -----
            if (error instanceof DOMException && error.name === 'AbortError') {

                //  -----  avisar de la navegación abortada  -----
                console.info(`⏭️ Navegación abortada por una nueva navegación: ${route?.id || '(sin id)'}`);

                //  -----  salir sin notificar  -----
                return;

            }

            //  -----  notificar el error de carga  -----
            notifyRouteLoadError(route, error, source);

        }

        //  -----  liberar el estado si esta sigue siendo la navegación activa  -----
        finally {

            //  -----  comparar identidad para no pisar una navegación nueva  -----
            if (activeNavigationAbort === controller) {

                //  -----  liberar el flag de navegación  -----
                isNavigating = false;

                //  -----  limpiar el controller activo  -----
                activeNavigationAbort = null;

            }

        }

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
        await loadContent(route404, source);

        //  -----  devolver la ruta 404 cargada  -----
        return route404;

    };



    /**
     * -----------------------------------
     * -----  `setupEventListeners()`  -----
     * -----------------------------------
     * - Configura los clics en enlaces internos y la navegación atrás/adelante.
     * @return {void}
     */
    const setupEventListeners = () => {

        //  -----  click en enlaces internos  -----
        document.addEventListener('click', (event) => {

            /** @type {Element|null} - `elemento clicado` */
            const target = event.target instanceof Element ? event.target : null;

            //  -----  si no hay elemento, salir  -----
            if (!target)
                //  -----  no hay enlace que resolver  -----
                return;

            /** @type {HTMLAnchorElement|null} - `enlace con data-id o data-route` */
            const link = /** @type {HTMLAnchorElement|null} */ (target.closest('a[data-id], a[data-route]'));

            //  -----  si el clic no es sobre un enlace interno, salir  -----
            if (!link)
                //  -----  dejar el comportamiento nativo  -----
                return;

            //  -----  respetar modificadores, botón y defaultPrevented  -----
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                //  -----  dejar que el navegador abra el enlace  -----
                return;

            //  -----  cancelar la navegación nativa  -----
            event.preventDefault();

            /** - `archivo de ruta desde data-route` */
            const routeFile = link.dataset.route;

            /** - `id de ruta desde data-id` */
            const routeId = link.dataset.id;

            //  -----  si hay data-route, importar por archivo  -----
            if (routeFile) {

                //  -----  importar y cargar la ruta  -----
                loadRouteModule(String(routeFile))
                    .then((route) => {

                        //  -----  si la ruta existe, cargarla  -----
                        if (route)
                            //  -----  cargar la ruta del enlace  -----
                            loadContent(route, 'click');

                        //  -----  si no existe, cargar la 404  -----
                        else
                            //  -----  cargar la 404  -----
                            loadNotFoundRoute('click');

                    })
                    .catch(() => {

                        //  -----  si el import falla, cargar la 404  -----
                        loadNotFoundRoute('click');

                    });

                //  -----  salir tras la carga por data-route  -----
                return;

            }

            //  -----  si hay data-id, buscar en el manifiesto  -----
            if (routeId) {

                /** @type {VanillaSpaCoreRouteManifest|undefined} - `entrada del manifiesto` */
                const entry = findManifestEntryById(String(routeId));

                //  -----  si la entrada existe, importar su archivo  -----
                if (entry) {

                    //  -----  importar y cargar la ruta  -----
                    loadRouteModule(entry.file)
                        .then((route) => {

                            //  -----  si la ruta existe, cargarla  -----
                            if (route)
                                //  -----  cargar la ruta del manifiesto  -----
                                loadContent(route, 'click');

                            //  -----  si no existe, cargar la 404  -----
                            else
                                //  -----  cargar la 404  -----
                                loadNotFoundRoute('click');

                        })
                        .catch(() => {

                            //  -----  si el import falla, cargar la 404  -----
                            loadNotFoundRoute('click');

                        });

                }

                //  -----  si el id no está en el manifiesto, cargar la 404  -----
                else {

                    //  -----  cargar la 404  -----
                    loadNotFoundRoute('click');

                }

                //  -----  salir tras resolver el data-id  -----
                return;

            }

            //  -----  enlace interno sin ruta resoluble: cargar la 404  -----
            loadNotFoundRoute('click');

        });



        //  -----  navegación atrás/adelante  -----
        window.addEventListener('popstate', (event) => {

            //  -----  detectar si el navegador ya animó la transición  -----
            hasUAVisualTransition = /** @type {PopStateEvent & { hasUAVisualTransition?: boolean }} */ (event).hasUAVisualTransition === true;

            /** @type {{ routeFile?: string, path?: string, favicon?: string }|null} - `estado del historial` */
            const state = /** @type {any} */ (event.state);

            //  -----  actualizar el favicon de inmediato si el state lo trae  -----
            if (state?.favicon)
                //  -----  cambiar el favicon  -----
                updateFavicon(state.favicon);

            /** - `archivo de ruta guardado en el historial` */
            const routeFile = state?.routeFile;

            /** - `path del state o pathname actual` */
            const raw = state?.path ?? window.location.pathname;

            //  -----  si el state trae routeFile, importar directo  -----
            if (routeFile) {

                //  -----  importar y cargar la ruta  -----
                loadRouteModule(String(routeFile))
                    .then((route) => {

                        //  -----  si la ruta existe, cargarla  -----
                        if (route)
                            //  -----  cargar la ruta del historial  -----
                            loadContent(route, 'popstate');

                        //  -----  si no existe, cargar la 404  -----
                        else
                            //  -----  cargar la 404  -----
                            loadNotFoundRoute('popstate');

                    })
                    .catch(() => {

                        //  -----  si el import falla, cargar la 404  -----
                        loadNotFoundRoute('popstate');

                    });

                //  -----  salir tras la carga por routeFile  -----
                return;

            }

            /** @type {VanillaSpaCoreRouteManifest|undefined} - `entrada del manifiesto` */
            const entry = findManifestEntryByPath(raw);

            //  -----  si la url está en el manifiesto, cargarla  -----
            if (entry) {

                //  -----  importar y cargar la ruta  -----
                loadRouteModule(entry.file)
                    .then((route) => {

                        //  -----  si la ruta existe, cargarla  -----
                        if (route)
                            //  -----  cargar la ruta del historial  -----
                            loadContent(route, 'popstate');

                        //  -----  si no existe, cargar la 404  -----
                        else
                            //  -----  cargar la 404  -----
                            loadNotFoundRoute('popstate');

                    })
                    .catch(() => {

                        //  -----  si el import falla, cargar la 404  -----
                        loadNotFoundRoute('popstate');

                    });

            }

            //  -----  si la url no está en el manifiesto, cargar la 404  -----
            else {

                //  -----  cargar la 404  -----
                loadNotFoundRoute('popstate');

            }

        });

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

        //  -----  configurar click y popstate antes de la carga inicial  -----
        setupEventListeners();

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
                    //  -----  arrancar la carga inicial sin bloquear el replaceState  -----
                    loadContent(route, 'init');

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

                //  -----  notificar el error de la ruta inicial  -----
                notifyRouteLoadError(undefined, error, 'init');

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
