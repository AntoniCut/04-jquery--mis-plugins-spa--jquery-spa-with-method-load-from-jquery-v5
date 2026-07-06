/*
    *  ---------------------------------------------------------------------------------------  *
    *  -----  /route-404-not-found-page.js  --  /src/routes/route-404-not-found-page.js  -----  *
    *  ---------------------------------------------------------------------------------------  *
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
    markdownShikiHtml
} = paths;


/** @type {import('../../types/index.js').Route} */
export const route404NotFoundPage = {
        id: '404NotFoundPage',
        favicon: `${favicon}/jquery-icon.svg`,
        pageTitle: '404 | Not Found',
        path: '404',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/404/404-not-found-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [],
        MarkdownShikiHtml: [],
        headerTitle: 'Página no encontrada - 404 Not Found Page',
        styles: [
            { href: `${styles}/pages/home.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};