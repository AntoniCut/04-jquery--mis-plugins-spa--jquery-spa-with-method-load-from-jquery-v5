/*
    *  ---------------------------------------------------------------------  *
    *  -----  spa-build-paths.d.js  --  /types/spa-build-paths.d.js  -----  *
    *  ---------------------------------------------------------------------  *
*/



/**
 * ------------------------------------
 * -----  `SpaBuildPathsVendor`  -----
 * ------------------------------------
 * @typedef {Object} SpaBuildPathsVendor - Rutas de vendors bajo node_modules.
 * @property {string} jqueryDir - Carpeta del paquete jquery.
 * @property {string} jqueryDistModuleDir - Directorio del módulo minificado.
 * @property {string} jqueryDistModule - Ruta al módulo ESM de jQuery.
 * @property {string} jqueryUIDir - Raíz de jquery-ui en node_modules.
 * @property {string} jqueryUIUiDir - Carpeta ui de jquery-ui.
 * @property {string[]} jqueryUIUi - Archivos de widgets copiados al navegador.
 */



/**
 * -------------------------------------
 * -----  `SpaBuildPathsPackages`  -----
 * -------------------------------------
 * @typedef {Object} SpaBuildPathsPackages - Rutas del paquete spa-server usadas en copyConfig.
 * @property {string} spaServerSiteBaseFile - site-base canónico en el workspace.
 * @property {string} spaServerSiteBaseDir - Directorio padre del site-base.
 */



/**
 * ---------------------------------
 * -----  `SpaBuildPathsSrc`  -----
 * ---------------------------------
 * @typedef {Object} SpaBuildPathsSrc - Globs y carpetas bajo dirs.src.
 * @property {string} assetsDir - Carpeta de assets.
 * @property {string} assets - Glob de assets.
 * @property {string} claseImagesPng - Glob de capturas PNG.
 * @property {string} configDir - Reexport de site-base en src/.
 * @property {string} config - Glob del config en src/.
 * @property {string} componentsDir - Componentes compartidos.
 * @property {string} components - Glob de componentes.
 * @property {string} fontsDir - Fuentes.
 * @property {string} fonts - Glob de fuentes.
 * @property {string} libsDir - Librerías del proyecto.
 * @property {string} libs - Glob de libs.
 * @property {string} markdownShikiDir - HTML Shiki generado.
 * @property {string} markdownShiki - Glob markdown-shiki.
 * @property {string} pagesDir - Shells de página.
 * @property {string} pages - Glob de pages.
 * @property {string} pagesComponentsDir - Fragmentos de página.
 * @property {string} pagesComponents - Glob de pages-components.
 * @property {string} pdfsDir - PDFs estáticos.
 * @property {string} pdfs - Glob de pdfs.
 * @property {string} pluginsDir - Plugins locales del sitio.
 * @property {string} plugins - Glob de plugins.
 * @property {string} routesDir - Módulos de ruta.
 * @property {string} routes - Glob de routes.
 * @property {string} spaDir - Config SPA del sitio.
 * @property {string} spa - Glob de spa.
 * @property {string} servicesDir - Servicios PHP/JSON.
 * @property {string} services - Glob de services.
 * @property {string} scriptsDir - Scripts por página.
 * @property {string} scripts - Glob de scripts.
 * @property {string} scriptsNoMap - Exclusión de source maps en scripts.
 * @property {string} main - Entrada principal del navegador.
 * @property {string} scssGlobals - SCSS global.
 * @property {string} scssPagesDir - SCSS por página.
 * @property {string} scssPages - Glob de scss/pages.
 * @property {string} scssAll - Todo el árbol scss.
 */



/**
 * -------------------------------------
 * -----  `SpaBuildPathsJqSpaCore`  -----
 * -------------------------------------
 * @typedef {Object} SpaBuildPathsJqSpaCore - Rutas del framework jq-spa-core.
 * @property {string} root - Fuente publicable en packages/.
 * @property {string} appDir - Destino bajo app/framework.
 * @property {string} publish - Glob de publicación del core.
 * @property {string} libsDir - libs del core.
 * @property {string} libs - Glob de libs del core.
 * @property {string} pluginsDir - plugins del core.
 * @property {string} plugins - Glob de plugins del core.
 * @property {string} vendorJqueryDest - Destino del vendor jQuery en app/.
 * @property {string} vendorJqueryUiDest - Destino del vendor jQuery UI en app/.
 */



/**
 * -------------------------------------------
 * -----  `SpaBuildPathsSpaLoadingEffect`  -----
 * -------------------------------------------
 * @typedef {Object} SpaBuildPathsSpaLoadingEffect - Rutas del paquete spa-loading-effect.
 * @property {string} root - Fuente publicable.
 * @property {string} appDir - Destino en app/framework.
 * @property {string} publish - Glob de publicación.
 */



/**
 * ---------------------------------
 * -----  `SpaBuildPathsApp`  -----
 * ---------------------------------
 * @typedef {Object} SpaBuildPathsApp - Globs sobre app/ para minificado a dist/.
 * @property {string} html - HTML en app/.
 * @property {string} css - CSS en app/.
 * @property {string} js - JavaScript en app/.
 * @property {string} jsNoMap - Exclusión de maps en app/.
 * @property {string} php - PHP en app/.
 */



/**
 * -----------------------------
 * -----  `SpaBuildPaths`  -----
 * -----------------------------
 * @typedef {Object} SpaBuildPaths - Rutas resueltas que consumen las tareas Gulp.
 * @property {string} srcRoot - Prefijo dirs.src.
 * @property {string} appRoot - Prefijo dirs.app.
 * @property {string} distRoot - Prefijo dirs.dist.
 * @property {SpaBuildPathsVendor} vendor - Vendors desde node_modules.
 * @property {SpaBuildPathsPackages} packages - Rutas de spa-server.
 * @property {SpaBuildPathsSrc} src - Origen bajo src/.
 * @property {SpaBuildPathsJqSpaCore} jqSpaCore - Framework jq-spa-core.
 * @property {SpaBuildPathsSpaLoadingEffect} spaLoadingEffect - Loader inicial.
 * @property {SpaBuildPathsApp} app - Salida de desarrollo para minificar.
 */



//  -----  convierte los @typedef en tipos importables con import('...').Nombre  -----
export {};