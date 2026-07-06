/*
    *  -----------------------------------------------------------------------------  *
    *  -----  /route-react-page.js  --  /src/routes/route-react-page.js  -----  *
    *  -----------------------------------------------------------------------------  *
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
export const routeReactPage = {
        id: 'reactPage',
        favicon: `${favicon}/react-icon.svg`,
        pageTitle: 'React — Biblioteca UI Declarativa',
        path: 'stack/react-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/react/react-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/react/react-description.html`, target: '[data-component-page="reactDescription"]' },
            { url: `${pagesComponents}/stack/react/react-demo.html`, target: '[data-component-page="reactDemo"]' },
        ],
        MarkdownShikiHtml: [
    
            {
                fileName: 'react-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/react/react-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/react`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'react-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/react-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/react`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'react-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/react-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/react`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'react-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/react-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/react`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'react-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/react-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/react`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'React — Biblioteca UI Declarativa',
        styles: [
            { href: `${styles}/pages/stack/react-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/react-page.cjs.js` },
            { src: `${scripts}/pages/stack/react-page.esm.js`, type: 'module' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};