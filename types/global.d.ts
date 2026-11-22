/*
    *  -------------------------------------------------  *
    *  -----  global.d.ts  --  /types/global.d.ts  -----  *
    *  -------------------------------------------------  *
*/


//  -----  Declaración de tipos globales  -----  //
interface Window {
    
    /** - `Marca de la primera ruta` */
    __spaFirstRouteLoaded?: boolean;
    
    /** - `JQuery` $ = jQuery*/
    $: JQueryStatic;
    
    /** - `jQuery` jQuery = $*/
    jQuery: JQueryStatic;
}
