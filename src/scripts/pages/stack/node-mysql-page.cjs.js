// @ts-nocheck
/*
    *  -----------------------------------------------------------------------------------------  *
    *  -----  node-mysql-page.cjs.js  --  /src/scripts/pages/stack/node-mysql-page.cjs.js  -----  *
    *  -----------------------------------------------------------------------------------------  *
*/


(() => {

    /** @type {HTMLElement|null} - `aviso del script clásico` */
    const status = document.querySelector('[data-node-mysql-cjs-status]');

    //  -----  salir si el demo todavía no está en el DOM  -----
    if (!status)
        //  -----  no hay destino para el aviso  -----
        return;

    //  -----  confirmar que el script clásico ya se ejecutó  -----
    status.textContent = 'node-mysql-page.cjs.js cargado. La consulta la envía el módulo ESM.';

})();
