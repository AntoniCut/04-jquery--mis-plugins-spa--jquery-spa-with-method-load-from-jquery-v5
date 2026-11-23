/*
    *  --------------------------------------------------------------------  *
    *  -----  site-base.js  --  packages/spa-server/src/site-base.js  -----  *
    *  --------------------------------------------------------------------  *
*/


/** - `patrón válido de SITE_BASE con subcarpeta: empieza por /, sin / final, sin espacios ni //` */
const SITE_BASE_SEGMENT_PATTERN = /^(\/[A-Za-z0-9._~-]+)+$/;



/**
 * -------------------------------------
 * -----  `readSiteBaseFromEnv()`  -----
 * -------------------------------------
 * - Lee `SITE_BASE` del entorno de Node y comprueba que tenga la forma esperada.
 * - Los procesos de Node cargan `dotenv/config` antes de importar este módulo.
 * - Vacío o `/` significa sitio en la raíz del dominio (sin prefijo de URL).
 * @return {string} - Base pública del sitio: `''` en la raíz, o `/mis-plugins-spa/mi-proyecto`.
 */
const readSiteBaseFromEnv = () => {

    /** @type {string | undefined} - `valor crudo de la variable de entorno` */
    const rawBase = globalThis.process?.env?.SITE_BASE;

    //  -----  si la variable no existe, abortar con un mensaje claro  -----
    if (rawBase === undefined) {

        //  -----  lanzar el error sin valor por defecto: un fallback sería otro literal  -----
        throw new Error('Falta la variable de entorno SITE_BASE. Defínela en .env (ver .env.example). Para la raíz del dominio use SITE_BASE= vacío.');
    }

    /** - `valor recortado sin espacios laterales` */
    const trimmedBase = rawBase.trim();

    //  -----  raíz del dominio: vacío o solo una barra  -----
    if (trimmedBase === '' || trimmedBase === '/') {

        //  -----  devolver cadena vacía para rutas y <base href="/">  -----
        return '';
    }

    //  -----  si el valor no cumple el patrón, abortar indicando qué se recibió  -----
    if (!SITE_BASE_SEGMENT_PATTERN.test(trimmedBase)) {

        //  -----  lanzar el error nombrando la variable y el valor rechazado  -----
        throw new Error(`SITE_BASE no es válida: "${rawBase}". Debe ser vacía (raíz), o empezar por "/" sin "/" final y sin "//".`);
    }

    //  -----  devolver el valor ya validado  -----
    return trimmedBase;
};



/**
 * ------------------------------------------
 * -----  `readSiteBaseFromDocument()`  -----
 * ------------------------------------------
 * - Deduce la base pública a partir de `<base href>` de index.html.
 * @return {string} - Base pública del sitio sin barra final.
 */
const readSiteBaseFromDocument = () => {

    //  -----  devolver el pathname de la url base del documento sin la barra final  -----
    return new URL(document.baseURI).pathname.replace(/\/$/, '');
};



/** @type {string} - `base pública del sitio: en el navegador sale de <base href>; en Node, de SITE_BASE` */
export const base = typeof document !== 'undefined'
    ? readSiteBaseFromDocument()
    : readSiteBaseFromEnv();
