/*
    *  ---------------------------------------------------------------------  *
    *  -----  jq-spa-core-package.d.ts  --  /types/jq-spa-core-package.d.ts  -----  *
    *  ---------------------------------------------------------------------  *
*/


//  -----  resolución de tipos para imports @antonydev/jq-spa-core en checkJs  -----
//  -----  `JqSpaCoreStartOptions` vive solo en jq-spa-core-start.d.js (@typedef)  -----


/// <reference path="./jq-spa-core-start.d.js" />


declare module '@antonydev/jq-spa-core' {

    /** - `arranque del motor jQuery + plugin SPA v5` */
    export function start(options: JqSpaCoreStartOptions): void;

}


declare module '@antonydev/jq-spa-core/start.js' {

    /** - `arranque del motor jQuery + plugin SPA v5` */
    export function start(options: JqSpaCoreStartOptions): void;

}