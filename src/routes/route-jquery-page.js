/*
    *  --------------------------------------------------------------------------------  *
    *  -----  /route-jquery-page.js  --  /src/routes/route-jquery-page.js  -----  *
    *  --------------------------------------------------------------------------------  *
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
export const routeJqueryPage = {
        id: 'jqueryPage',
        favicon: `${favicon}/jquery-icon.svg`,
        pageTitle: 'jQuery — The Write Less, Do More Library',
        path: 'stack/jquery-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/jquery/jquery-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/jquery/jquery-description.html`, target: '[data-component-page="jqueryDescription"]' },
            { url: `${pagesComponents}/stack/jquery/jquery-demo.html`, target: '[data-component-page="jqueryDemo"]' },
        ],
        MarkdownShikiHtml: [
    
            {
                fileName: 'jquery-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/jquery/jquery-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/jquery`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'jquery-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/jquery-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/jquery`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'jquery-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/jquery-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/jquery`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'jquery-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/jquery-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/jquery`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'jquery-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/jquery-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/jquery`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'jQuery — The Write Less, Do More Library',
        styles: [
            { href: `${styles}/pages/stack/jquery-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/jquery-page.cjs.js` },
            { src: `${scripts}/pages/stack/jquery-page.esm.js`, type: 'module' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};