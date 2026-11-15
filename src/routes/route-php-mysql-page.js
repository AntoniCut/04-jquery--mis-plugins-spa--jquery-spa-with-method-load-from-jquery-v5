/*
    *  ------------------------------------------------------------------------------  *
    *  -----  route-php-mysql-page.js  --  /src/routes/route-php-mysql-page.js  -----  *
    *  ------------------------------------------------------------------------------  *
*/


import { paths } from './paths.js';


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


/** @type {Route} - `ruta de la página PHP con MySQL` */
export const routePhpMysqlPage = {
        id: 'phpMysqlPage',
        favicon: `${favicon}/mysql-icon.svg`,
        pageTitle: 'PHP con MySQL',
        path: 'stack/php-mysql-page',
        components: {
            "#layoutHeader": layoutHeader,
            "#btnNavbar": btnNavbar,
            "#btnNavbarThemesJQueryUI": btnNavbarThemesJQueryUI,
            "#layoutNavbar": layoutNavbar,
            "#layoutNavbarThemesUI": layoutNavbarThemesUI,
            "#layoutMain": `${pages}/stack/php-mysql/php-mysql-page.html`,
            "#layoutFooter": layoutFooter,
        },
        pagesComponents: [
            { url: `${pagesComponents}/stack/php-mysql/php-mysql-description.html`, target: '[data-component-page="phpMysqlDescription"]' },
            { url: `${pagesComponents}/stack/php-mysql/php-mysql-demo.html`, target: '[data-component-page="phpMysqlDemo"]' },
        ],
        MarkdownShikiHtml: [
            {
                fileName: 'php-mysql-page-html.html',
                fileExtension: 'html',
                urlInput: `${pages}/stack/php-mysql/php-mysql-page.html`,
                urlOutput: `${markdownShikiHtml}/pages/php-mysql`,
                target: '[data-shiki="codeHtml"]',
            },
            {
                fileName: 'php-mysql-page-css.html',
                fileExtension: 'css',
                urlInput: `${styles}/pages/stack/php-mysql-page.css`,
                urlOutput: `${markdownShikiHtml}/pages/php-mysql`,
                target: '[data-shiki="codeCss"]',
            },
            {
                fileName: 'php-mysql-page-scss.html',
                fileExtension: 'scss',
                urlInput: `${scssPages}/stack/php-mysql-page.scss`,
                urlOutput: `${markdownShikiHtml}/pages/php-mysql`,
                target: '[data-shiki="codeScss"]',
            },
            {
                fileName: 'php-mysql-page.cjs-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/php-mysql-page.cjs.js`,
                urlOutput: `${markdownShikiHtml}/pages/php-mysql`,
                target: '[data-shiki="codeCjsJs"]',
            },
            {
                fileName: 'php-mysql-page.esm-js.html',
                fileExtension: 'js',
                urlInput: `${scripts}/pages/stack/php-mysql-page.esm.js`,
                urlOutput: `${markdownShikiHtml}/pages/php-mysql`,
                target: '[data-shiki="codeEsmJs"]',
            },
        ],
        headerTitle: 'PHP con MySQL',
        styles: [
            { href: `${styles}/pages/stack/php-mysql-page.css` },
        ],
        scripts: [
            { src: `${scripts}/tooltips.js` },
            { src: `${scripts}/pages/stack/php-mysql-page.cjs.js` },
            { src: `${scripts}/pages/stack/php-mysql-page.esm.js`, type: 'module', exportFunctionName: 'mount' },
        ],
        libs: [
            { name: 'tooltip' },
            { name: 'draggable' },
        ],
};
