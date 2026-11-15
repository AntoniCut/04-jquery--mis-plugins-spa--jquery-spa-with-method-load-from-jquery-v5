/*
    *  ----------------------------------------------------------------------  *
    *  -----  route-mysql-page.js  --  /src/routes/route-mysql-page.js  -----  *
    *  ----------------------------------------------------------------------  *
*/


import { paths } from './paths.js';


/** - `desestructuración de paths` */
const {
    favicon,
    layoutHeader,
    btnNavbar,
    btnNavbarThemesJQueryUI,
    layoutNavbar,
    layoutNavbarThemesUI,
    pages,
    pagesComponents,
    scssPages,
    layoutFooter,
    styles,
    scripts,
    markdownShikiHtml
} = paths;


/** @type {Route} - `ruta de la página MySQL` */
export const routeMysqlPage = {
        id: 'mysqlPage',
        favicon: `${favicon}/mysql-icon.svg`,
        pageTitle: 'MySQL — Consultas a la base de datos',
        path: 'stack/mysql-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/mysql/mysql-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/mysql/mysql-description.html`, target: '[data-component-page="mysqlDescription"]' },
            { url: `${pagesComponents}/stack/mysql/mysql-demo.html`, target: '[data-component-page="mysqlDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'mysql-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/mysql/mysql-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/mysql`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'mysql-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/mysql-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/mysql`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'mysql-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/mysql-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/mysql`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'mysql-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/mysql-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/mysql`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'mysql-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/mysql-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/mysql`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'MySQL — Consultas a la base de datos',
        styles: [
            { href: `${styles}/pages/stack/mysql-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/mysql-page.cjs.js` },
            { src: `${scripts}/pages/stack/mysql-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};
