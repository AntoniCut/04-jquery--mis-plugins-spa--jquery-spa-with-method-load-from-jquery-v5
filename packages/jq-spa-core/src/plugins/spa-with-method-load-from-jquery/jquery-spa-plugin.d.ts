/*
    ----------------------------------------------------------
    ----------  /spa-with-method-load-from-jquery/  ----------
    ----------  /jquery-spa-plugin.d.ts  ---------------------
    ----------------------------------------------------------
*/


interface JQuery {
        
        /**
         * ----------------------------------------------------
         * -----  plugin `spaWithMethodLoadFromJQuery()`  -----
         * ----------------------------------------------------
         * - `Plugin SPA` personalizado que usa el método `load()`.
         * @param {ConfigOptionsSPA} options - `Objeto de configuración para la SPA`.
         * @returns {JQuery} - `Retorna el objeto jQuery para encadenamiento`.
         */
        spaWithMethodLoadFromJQuery(options: ConfigOptionsSPA): JQuery;

}
