/*
    *  ------------------------------------------------------------------  *
    *  -----  route-php-page.js  --  /src/routes/route-php-page.js  -----  *
    *  ------------------------------------------------------------------  *
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


/** @type {Route} - `ruta de la página PHP` */
export const routePhpPage = {
        id: 'phpPage',
        favicon: `${favicon}/php-icon.svg`,
        pageTitle: 'PHP — Validación en el servidor',
        path: 'stack/php-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/php/php-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/php/php-description.html`, target: '[data-component-page="phpDescription"]' },
            { url: `${pagesComponents}/stack/php/php-demo.html`, target: '[data-component-page="phpDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'php-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/php/php-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/php`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'php-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/php-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/php`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'php-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/php-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/php`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'php-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/php-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/php`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'php-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/php-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/php`,
                target: '[data-shiki="codeEsmJs"]',
            },
            {
                fileName: 'php-page-php.html',
                fileExtension: 'php',
                urlInput: `${base}/src/services/php/validate.php`,
                urlOutput: `${markdownShikiHtml}/pages/php`,
                target: '[data-shiki="codePhp"]',
            },
        ],
        headerTitle: 'PHP — Validación en el servidor',
        styles: [
            { href: `${styles}/pages/stack/php-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/php-page.cjs.js` },
            { src: `${scripts}/pages/stack/php-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};
