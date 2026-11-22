/*
    *  -------------------------------------------------  *
    *  -----  global.d.ts  --  /types/global.d.ts  -----  *
    *  -------------------------------------------------  *
*/


//  -----  Declaración de tipos globales  -----  //
interface Window {
    __spaFirstRouteLoaded?: boolean;
    $: JQueryStatic;
    jQuery: JQueryStatic;
}
