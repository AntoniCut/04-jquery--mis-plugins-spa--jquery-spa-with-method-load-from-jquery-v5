/*
    *  -----------------------------------------------------------------------  *
    *  -----  /route-astro-page.js  --  /src/routes/route-astro-page.js  -----  *
    *  -----------------------------------------------------------------------  *
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
    scssPages,
    layoutFooter,
    styles,
    scripts,
    markdownShikiHtml
} = paths;


/** @type {import('../../types/index.js').Route} */
export const routeAstroPage = {
        id: 'astroPage',
        favicon: `${favicon}/astro-official.svg`,
        pageTitle: 'Astro — Framework de Sitios Estáticos',
        path: 'stack/astro-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/astro/astro-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/astro/astro-description.html`, target: '[data-component-page="astroDescription"]' },
            { url: `${pagesComponents}/stack/astro/astro-demo.html`, target: '[data-component-page="astroDemo"]' },
        ],
        MarkdownShikiHtml: [

            {
                fileName: 'astro-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/astro/astro-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/astro`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'astro-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/astro-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/astro`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'astro-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/astro-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/astro`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'astro-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/astro-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/astro`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'astro-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/astro-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/astro`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'Astro — Framework de Sitios Estáticos',
        styles: [
            { href: `${styles}/pages/stack/astro-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/astro-page.cjs.js` },
            { src: `${scripts}/pages/stack/astro-page.esm.js`, type: 'module' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};