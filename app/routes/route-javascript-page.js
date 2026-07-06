/*
    *  ------------------------------------------------------------------------------------  *
    *  -----  /route-javascript-page.js  --  /src/routes/route-javascript-page.js  -----  *
    *  ------------------------------------------------------------------------------------  *
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
export const routeJavascriptPage = {
        id: 'javascriptPage',
        favicon: `${favicon}/javascript-icon.svg`,
        pageTitle: 'JavaScript ES6+ — El Lenguaje de la Web',
        path: 'stack/javascript-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/javascript/javascript-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/javascript/javascript-description.html`, target: '[data-component-page="javascriptDescription"]' },
            { url: `${pagesComponents}/stack/javascript/javascript-demo.html`, target: '[data-component-page="javascriptDemo"]' },
        ],
        MarkdownShikiHtml: [
    
            {
                fileName: 'javascript-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/javascript/javascript-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/javascript`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'javascript-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/javascript-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/javascript`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'javascript-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/javascript-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/javascript`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'javascript-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/javascript-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/javascript`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'javascript-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/javascript-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/javascript`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'JavaScript ES6+ — El Lenguaje de la Web',
        styles: [
            { href: `${styles}/pages/stack/javascript-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/javascript-page.cjs.js` },
            { src: `${scripts}/pages/stack/javascript-page.esm.js`, type: 'module' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};