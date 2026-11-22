/*
    *  -----------------------------------------------------------------  *
    *  -----  jq-spa-core-start.d.js  --  /types/jq-spa-core-start.d.js  -----  *
    *  -----------------------------------------------------------------  *
*/



/**
 * ----------------------------------------
 * -----  `JqSpaCoreStartOptions`  -----
 * ----------------------------------------
 * @typedef {Object} JqSpaCoreStartOptions - Opciones que el sitio pasa a start() del core.
 * @property {boolean} [isJQueryModule=true] - true: carga ESM; false: fallback CDN clásico.
 * @property {() => void} initSpa - Registra el plugin y arranca la SPA del proyecto (spa.js).
 */