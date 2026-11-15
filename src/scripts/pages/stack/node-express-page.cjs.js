// @ts-nocheck
/*
    *  ---------------------------------------------------------------------------------------------  *
    *  -----  node-express-page.cjs.js  --  /src/scripts/pages/stack/node-express-page.cjs.js  -----  *
    *  ---------------------------------------------------------------------------------------------  *
*/


(() => {

    /** @type {HTMLElement|null} - `aviso del script clásico` */
    const status = document.querySelector('[data-node-express-cjs-status]');

    //  -----  salir si el demo todavía no está en el DOM  -----
    if (!status)
        //  -----  no hay destino para el aviso  -----
        return;

    //  -----  confirmar que el script clásico ya se ejecutó  -----
    status.textContent = 'node-express-page.cjs.js cargado. El CRUD lo envía el módulo ESM.';

})();
