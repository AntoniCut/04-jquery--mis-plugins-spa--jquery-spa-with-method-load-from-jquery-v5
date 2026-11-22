/*
    *  ----------------------------------------  *
    *  -----  /main.js  --  /src/main.js  -----  *
    *  ----------------------------------------  *
*/


//  -----  tipos del paquete jq-spa-core  -----
/// <reference path="../types/jq-spa-core-package.d.ts" />

//  -----  efecto de carga inicial (SPEC 05 moverá esto)  -----
import { effectLoadingPage } from './effects/effect-loading-page.js';

//  -----  arranque del motor en el framework  -----
import { start } from '@antonydev/jq-spa-core';

//  -----  configuración SPA del sitio  -----
import { spa } from './spa/spa.js';

//  -----  base pública para imports externos  -----
import { base } from './routes/paths.js';


//  -----  efecto de loading solo en navegador  -----
effectLoadingPage();


//  -----  reexport de base para compatibilidad  -----
export { base };


/** - `true: ESM; false: fallback CDN clásico` */
const isJQueryModule = true;


//  -----  delegar carga jQuery, plugin y SPA al core  -----
start({
    isJQueryModule,
    initSpa: spa,
});