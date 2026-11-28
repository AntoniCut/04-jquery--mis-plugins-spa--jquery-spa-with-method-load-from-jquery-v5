/*
    *  ---------------------------------------------------------------------------------------------  *
    *  -----  vanilla-spa-core-package.d.ts  --  /packages/vanilla-spa-core/types/vanilla-spa-core-package.d.ts  -----  *
    *  ---------------------------------------------------------------------------------------------  *
*/


//  -----  resolución de tipos para imports @antonydev/vanilla-spa-core en checkJs  -----
//  -----  las opciones y rutas viven en los .d.js del paquete  -----


/// <reference path="./vanilla-spa-core-start.d.js" />
/// <reference path="./vanilla-spa-core-options.d.js" />
/// <reference path="./vanilla-spa-core-route.d.js" />


declare module '@antonydev/vanilla-spa-core' {

    /** - `arranque del motor vanilla; si llega initSpa, lo invoca` */
    export function start(options: VanillaSpaCoreStartOptions): void;

    /** - `inicializa el motor vanilla con el manifiesto y la base` */
    export function spaLoaderContentHtml(options?: VanillaSpaCoreOptions): void;

}


declare module '@antonydev/vanilla-spa-core/start.js' {

    /** - `arranque del motor vanilla; si llega initSpa, lo invoca` */
    export function start(options: VanillaSpaCoreStartOptions): void;

    /** - `inicializa el motor vanilla con el manifiesto y la base` */
    export function spaLoaderContentHtml(options?: VanillaSpaCoreOptions): void;

}


declare module '@antonydev/vanilla-spa-core/spa-loader-content-html.js' {

    /** - `inicializa el motor vanilla con el manifiesto y la base` */
    export function spaLoaderContentHtml(options?: VanillaSpaCoreOptions): void;

}
