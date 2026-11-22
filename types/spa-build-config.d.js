/*
    *  ---------------------------------------------------------------------  *
    *  -----  spa-build-config.d.js  --  /types/spa-build-config.d.js  -----  *
    *  ---------------------------------------------------------------------  *
*/



/**
 * ---------------------------
 * -----  `SpaBuildDirs`  -----
 * ---------------------------
 * @typedef {Object} SpaBuildDirs - Carpetas de origen, desarrollo y build (relativas a projectRoot).
 * @property {string} src - Raíz de fuentes que Gulp copia o compila.
 * @property {string} app - Salida de desarrollo que lee el navegador en local.
 * @property {string} dist - Salida de producción (minificada).
 * @property {string} markdownShiki - HTML generado por Shiki antes de copiarse a app/.
 * @property {string} routes - Módulos de ruta escaneados para MarkdownShikiHtml.
 */



/**
 * ----------------------------
 * -----  `SpaBuildShiki`  -----
 * ----------------------------
 * @typedef {Object} SpaBuildShiki - Opciones del generador markdown-shiki.
 * @property {string} theme - Tema de Shiki (p. ej. dark-plus).
 * @property {boolean} stripHeaderBanner - Si quitar el banner del fuente antes de resaltar.
 * @property {RegExp} routeFilePattern - Archivos de ruta a importar (excluye el manifiesto aparte).
 * @property {string} routeManifestFile - Nombre del manifiesto que no se escanea.
 */



/**
 * --------------------------------
 * -----  `SpaBuildSiteBase`  -----
 * --------------------------------
 * @typedef {Object} SpaBuildSiteBase - Publicación de SITE_BASE para Node y navegador.
 * @property {string} packageFile - site-base canónico en el workspace (spa-server).
 * @property {string} appConfigFile - Destino en app/ que importa paths.js en el navegador.
 * @property {string} srcReexportDir - Carpeta del reexport fino en src/ (checkJs y paths en src/).
 */



/**
 * ---------------------------
 * -----  `SpaBuildRoot`  -----
 * ---------------------------
 * @typedef {Object} SpaBuildRoot - Artefactos en la raíz del proyecto que el build minifica a dist/.
 * @property {string} indexHtml - Shell con base href e import map.
 * @property {string} htaccess - Reglas Apache con marcador %SITE_BASE%.
 */



/**
 * ------------------------------------
 * -----  `SpaBuildConvertImages`  -----
 * ------------------------------------
 * @typedef {Object} SpaBuildConvertImages - PNG de capturas convertidos a AVIF.
 * @property {string} pngGlob - Glob de png bajo src/assets.
 */



/**
 * -----------------------------
 * -----  `SpaBuildVendor`  -----
 * -----------------------------
 * @typedef {Object} SpaBuildVendor - Copia de jQuery y jQuery UI a app/libs (hasta SPEC 04).
 * @property {string} jqueryModule - Ruta al módulo minificado de jquery en node_modules.
 * @property {string[]} jqueryUiWidgets - Módulos ui de jquery-ui copiados al navegador.
 */



/**
 * ----------------------------------
 * -----  `SpaBuildFramework`  -----
 * ----------------------------------
 * @typedef {Object} SpaBuildFramework - Fuentes del runtime del navegador en workspace (SPEC 04).
 * @property {string} jqSpaCore - Raíz publicable bajo packages/jq-spa-core/src (libs y plugin SPA).
 * @property {string} [jqSpaCoreApp] - Destino bajo app/ (p. ej. app/framework/jq-spa-core).
 */



/**
 * ------------------------------------
 * -----  `SpaBuildExtraCopyEntry`  -----
 * ------------------------------------
 * @typedef {Object} SpaBuildExtraCopyEntry - Copia adicional src → app (proyectos futuros).
 * @property {string} glob - Origen relativo a projectRoot.
 * @property {string} destDir - Destino bajo app/ (relativo a projectRoot).
 * @property {boolean} [binary] - Si el stream no debe forzar encoding de texto.
 */



/**
 * -----------------------------
 * -----  `SpaBuildConfig`  -----
 * -----------------------------
 * @typedef {Object} SpaBuildConfig - Configuración de @antonydev/spa-build leída desde spa.config.js.
 * @property {SpaBuildDirs} dirs - Carpetas del pipeline Gulp.
 * @property {SpaBuildShiki} shiki - Generación de bloques resaltados.
 * @property {SpaBuildSiteBase} siteBase - Publicación de site-base.js.
 * @property {SpaBuildRoot} root - index.html y .htaccess.
 * @property {SpaBuildConvertImages} convertImages - Conversión AVIF de capturas.
 * @property {SpaBuildVendor} vendor - Vendors copiados desde node_modules.
 * @property {SpaBuildFramework} [framework] - Runtime jq-spa-core hasta copyFramework (SPEC 04 paso 4).
 * @property {SpaBuildExtraCopyEntry[]} extraCopy - Copias opcionales; vacío en el piloto.
 */