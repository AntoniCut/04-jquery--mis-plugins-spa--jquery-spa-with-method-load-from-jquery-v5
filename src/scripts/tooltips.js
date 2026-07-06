/*
    *  --------------------------------------------------------  *
    *  -----  /tooltips.js  --  /src/scripts/tooltips.js  -----  *
    *  --------------------------------------------------------  *
*/

(($) => {


    console.log('\n')
    console.warn('-----  tooltips.js  -----');
    console.log('\n');


    /*
      -----------------------------------
      ----------  1. Tooltips  ----------
      -----------------------------------
  */

    if (typeof $.fn.tooltip !== 'function')
        return;

    //  -----  Evitar re-inicializar el widget al navegar entre rutas SPA  -----
    if ($(document).data('ui-tooltip')) {
        try {
            $(document).tooltip('destroy');
        } catch (_) { /* noop */ }
    }

    $(document).tooltip();

    
})(jQuery);
