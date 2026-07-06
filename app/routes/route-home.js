/*
    *  -----------------------------------------------------------  *
    *  -----  /route-home.js  --  /src/routes/route-home.js  -----  *
    *  -----------------------------------------------------------  *
*/


import { paths } from './paths.js';


/** - Desestructuracion de paths */
const {
    favicon,
    layoutHeader,
    btnNavbar,
    btnNavbarThemesJQueryUI,
    layoutNavbar,
    layoutNavbarThemesUI,
    pages,
    pagesComponents,
    layoutFooter,
    styles,
    scripts,
    markdownShikiHtml,
    pluginsSource
} = paths;


/** @type {import('../../types/index.js').Route} */
export const routeHome = {
        id: 'home',
        favicon: `${favicon}/jquery-icon.svg`,
        pageTitle: 'jQuery SPA With Method Load From jQuery v5',
        path: '',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/home.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/home-description.html`, target: '[data-component-page="homeDescription"]' },
            { url: `${pagesComponents}/home-demo.html`, target: '[data-component-page="homeDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'jquery.spa-with-method-load-from-jquery-v5.html',
                fileExtension: 'js',
                urlInput: `${pluginsSource}/spa-with-method-load-from-jquery/v5/jquery.spa-with-method-load-from-jquery.js`,
                urlOutput: `${markdownShikiHtml}/plugins/v5`,
                target: '[data-shiki="plugins"]',
            },
        ],
        headerTitle: 'Plugin jQuery SPA With Method Load From jQuery v5',
        styles: [
            { href: `${styles}/pages/home.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/home.cjs.js` },
            { src: `${scripts}/pages/home.esm.js`, type: 'module' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};