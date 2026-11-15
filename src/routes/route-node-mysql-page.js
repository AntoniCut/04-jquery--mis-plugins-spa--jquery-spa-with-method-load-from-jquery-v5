/*
    *  --------------------------------------------------------------------------------  *
    *  -----  route-node-mysql-page.js  --  /src/routes/route-node-mysql-page.js  -----  *
    *  --------------------------------------------------------------------------------  *
*/


import { base, paths } from './paths.js';


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


/** @type {Route} - `ruta de la página Node con MySQL` */
export const routeNodeMysqlPage = {
        id: 'nodeMysqlPage',
        favicon: `${favicon}/nodejs-icon.svg`,
        pageTitle: 'Node con MySQL',
        path: 'stack/node-mysql-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/node-mysql/node-mysql-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/node-mysql/node-mysql-description.html`, target: '[data-component-page="nodeMysqlDescription"]' },
            { url: `${pagesComponents}/stack/node-mysql/node-mysql-demo.html`, target: '[data-component-page="nodeMysqlDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'node-mysql-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/node-mysql/node-mysql-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/node-mysql`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'node-mysql-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/node-mysql-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/node-mysql`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'node-mysql-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/node-mysql-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/node-mysql`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'node-mysql-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/node-mysql-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/node-mysql`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'node-mysql-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/node-mysql-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/node-mysql`,
                target: '[data-shiki="codeEsmJs"]',
            },
            {
                fileName: 'node-mysql-page-server-js.html',
                fileExtension: 'js',
                urlInput: `${base}/api/src/mysql-query.js`,
                urlOutput: `${markdownShikiHtml}/pages/node-mysql`,
                target: '[data-shiki="codeServerJs"]',
            },
        ],
        headerTitle: 'Node con MySQL',
        styles: [
            { href: `${styles}/pages/stack/node-mysql-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/node-mysql-page.cjs.js` },
            { src: `${scripts}/pages/stack/node-mysql-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};
