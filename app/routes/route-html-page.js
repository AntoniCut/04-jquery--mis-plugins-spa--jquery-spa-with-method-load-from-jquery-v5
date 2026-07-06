/*
    *  ---------------------------------------------------------------------  *
    *  -----  /route-html-page.js  --  /src/routes/route-html-page.js  -----  *
    *  ---------------------------------------------------------------------  *
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
export const routeHtmlPage = {
        id: 'htmlPage',
        favicon: `${favicon}/html-icon.svg`,
        pageTitle: 'HTML5 — HyperText Markup Language',
        path: 'stack/html-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/html/html-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/html/html-description.html`, target: '[data-component-page="htmlDescription"]' },
            { url: `${pagesComponents}/stack/html/html-demo.html`, target: '[data-component-page="htmlDemo"]' },
        ],
        MarkdownShikiHtml: [
    
            {
                fileName: 'html-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/html/html-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/html`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'html-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/html-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/html`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'html-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/html-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/html`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'html-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/html-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/html`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'html-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/html-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/html`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'HTML5 — HyperText Markup Language',
        styles: [
            { href: `${styles}/pages/stack/html-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/html-page.cjs.js` },
            { src: `${scripts}/pages/stack/html-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};