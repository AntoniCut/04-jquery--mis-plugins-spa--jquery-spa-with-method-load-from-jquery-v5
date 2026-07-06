/*
    *  --------------------------------------------------------------------------------------------  *
    *  -----  /route-jquery-ui-page.js  --  /src/routes/route-jquery-ui-page.js  -----  *
    *  --------------------------------------------------------------------------------------------  *
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
    scssPages,
} = paths;


/** @type {import('../../types/index.js').Route} */
export const routeJqueryUiPage = {
        id: 'jqueryUiPage',
        favicon: `${favicon}/jquery-ui-icon.svg`,
        pageTitle: 'jQuery UI — Interactions, Widgets & Effects',
        path: 'stack/jquery-ui-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/jquery-ui/jquery-ui-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/jquery-ui/jquery-ui-description.html`, target: '[data-component-page="jqueryUiDescription"]' },
            { url: `${pagesComponents}/stack/jquery-ui/jquery-ui-demo.html`, target: '[data-component-page="jqueryUiDemo"]' },
        ],
        MarkdownShikiHtml: [
    
            {
                fileName: 'jquery-ui-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/jquery-ui/jquery-ui-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/jquery-ui`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'jquery-ui-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/jquery-ui-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/jquery-ui`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'jquery-ui-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/jquery-ui-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/jquery-ui`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'jquery-ui-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/jquery-ui-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/jquery-ui`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'jquery-ui-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/jquery-ui-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/jquery-ui`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'jQuery UI — Interactions, Widgets & Effects',
        styles: [
            { href: `${styles}/pages/stack/jquery-ui-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/jquery-ui-page.cjs.js` },
            { src: `${scripts}/pages/stack/jquery-ui-page.esm.js`, type: 'module' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};