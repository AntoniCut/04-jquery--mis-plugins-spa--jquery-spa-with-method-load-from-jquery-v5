/*
    *  ------------------------------------------------------------------------------------  *
    *  -----  route-node-express-page.js  --  /src/routes/route-node-express-page.js  -----  *
    *  ------------------------------------------------------------------------------------  *
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


/** @type {Route} - `ruta de la página Node con Express` */
export const routeNodeExpressPage = {
        id: 'nodeExpressPage',
        favicon: `${favicon}/express-icon.svg`,
        pageTitle: 'Node con Express',
        path: 'stack/node-express-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/node-express/node-express-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/node-express/node-express-description.html`, target: '[data-component-page="nodeExpressDescription"]' },
            { url: `${pagesComponents}/stack/node-express/node-express-demo.html`, target: '[data-component-page="nodeExpressDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'node-express-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/node-express/node-express-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/node-express`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'node-express-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/node-express-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/node-express`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'node-express-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/node-express-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/node-express`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'node-express-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/node-express-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/node-express`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'node-express-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/node-express-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/node-express`,
                target: '[data-shiki="codeEsmJs"]',
            },
            {
                fileName: 'node-express-page-server-js.html',
                fileExtension: 'js',
                urlInput: `${base}/api/src/tasks-router.js`,
                urlOutput: `${markdownShikiHtml}/pages/node-express`,
                target: '[data-shiki="codeServerJs"]',
            },
        ],
        headerTitle: 'Node con Express',
        styles: [
            { href: `${styles}/pages/stack/node-express-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/node-express-page.cjs.js` },
            { src: `${scripts}/pages/stack/node-express-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};
