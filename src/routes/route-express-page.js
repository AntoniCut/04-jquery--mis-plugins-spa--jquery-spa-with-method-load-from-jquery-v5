/*
    *  --------------------------------------------------------------------------  *
    *  -----  route-express-page.js  --  /src/routes/route-express-page.js  -----  *
    *  --------------------------------------------------------------------------  *
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


/** @type {Route} - `ruta de la página Express` */
export const routeExpressPage = {
        id: 'expressPage',
        favicon: `${favicon}/express-icon.svg`,
        pageTitle: 'Express — API de tareas en memoria',
        path: 'stack/express-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/express/express-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/express/express-description.html`, target: '[data-component-page="expressDescription"]' },
            { url: `${pagesComponents}/stack/express/express-demo.html`, target: '[data-component-page="expressDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'express-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/express/express-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/express`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'express-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/express-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/express`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'express-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/express-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/express`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'express-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/express-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/express`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'express-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/express-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/express`,
                target: '[data-shiki="codeEsmJs"]',
            },
            {
                fileName: 'express-page-server-js.html',
                fileExtension: 'js',
                urlInput: `${base}/api/src/tasks-router.js`,
                urlOutput: `${markdownShikiHtml}/pages/express`,
                target: '[data-shiki="codeServerJs"]',
            },
        ],
        headerTitle: 'Express — API de tareas en memoria',
        styles: [
            { href: `${styles}/pages/stack/express-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/express-page.cjs.js` },
            { src: `${scripts}/pages/stack/express-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};
