/*
    *  -------------------------------------------------  *
    *  -----  paths.js  --  /src/routes/paths.js  -----  *
    *  -------------------------------------------------  *
*/


import { base } from '../config/site-base.js';


/** - `base del proyecto: se reexporta desde src/config/site-base.js` */
export { base };


/** 
 * ------------------------
 * -----  `paths {}`  -----
 * ------------------------
 * - `path para las rutas de la SPA` 
 */
export const paths = {
    favicon: `${base}/app/assets/favicon`,
    layoutHeader: `${base}/app/components/layout/layout-header.html`,
    btnNavbar: `${base}/app/components/buttons/btn-navbar.html`,
    btnNavbarThemesJQueryUI: `${base}/app/components/buttons/btn-navbar-themes-jquery-ui.html`,
    layoutNavbar: `${base}/app/components/layout/layout-navbar.html`,
    layoutNavbarThemesUI: `${base}/app/components/layout/layout-navbar-themes-jquery-ui.html`,
    pages: `${base}/app/pages`,
    pagesComponents: `${base}/app/pages-components`,
    layoutFooter: `${base}/app/components/layout/layout-footer.html`,
    libs: `${base}/app/libs`,
    styles: `${base}/app/css`,
    scssPages: `${base}/src/scss/pages`,
    scripts: `${base}/app/js`,
    markdownShikiHtml: `${base}/app/markdown-shiki`,
    pluginsSource: `${base}/src/plugins`
}