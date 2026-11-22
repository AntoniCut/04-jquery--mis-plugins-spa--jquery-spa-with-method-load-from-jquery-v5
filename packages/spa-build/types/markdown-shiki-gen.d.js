/*
    *  -------------------------------------------------------------------------  *
    *  -----  markdown-shiki-gen.d.js  --  /types/markdown-shiki-gen.d.js  -----  *
    *  -------------------------------------------------------------------------  *
*/


/**
 * ------------------------
 * -----  `RouteModule`  -----
 * ------------------------
 * @typedef {Record<string, Route>} RouteModule - Módulo de ruta: cada export es una Route.
 */


/**
 * ---------------------------
 * -----  `ShikiGenResult`  -----
 * ---------------------------
 * @typedef {Object} ShikiGenResult - Resultado de la generación de un bloque markdown shiki.
 * @property {'generated' | 'skipped'} status - Si el bloque se escribió o se omitió.
 * @property {string} message - Texto que se muestra en consola.
 */
