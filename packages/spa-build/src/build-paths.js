/*
    *  -------------------------------------------------------------  *
    *  -----  build-paths.js  --  /packages/spa-build/src/build-paths.js  -----  *
    *  -------------------------------------------------------------  *
*/



//  -----  rutas de disco  -----
import path from 'node:path';




/**
 * --------------------------------
 * -----  `buildPaths(config)`  -----
 * --------------------------------
 * - Construye el objeto paths de Gulp a partir de spa.config.js.
 * @param {import('../types/spa-build-config.d.js').SpaBuildConfig} config - Configuración del proyecto.
 * @return {import('../types/spa-build-paths.d.js').SpaBuildPaths} - `Rutas de origen y destino usadas por las tareas Gulp`.
 */
export const buildPaths = (config) => {

    /** - `prefijo de fuentes` */
    const src = config.dirs.src;

    /** - `prefijo de salida de desarrollo` */
    const app = config.dirs.app;

    /** - `prefijo de build de producción` */
    const dist = config.dirs.dist;

    /** - `carpeta del html generado por shiki` */
    const markdownShikiDir = config.dirs.markdownShiki;

    /** - `módulo jquery copiado al navegador` */
    const jqueryModule = config.vendor.jqueryModule;

    /** - `carpeta del módulo jquery en node_modules` */
    const jqueryDistModuleDir = path.dirname(jqueryModule);

    /** - `carpeta ui de jquery-ui` */
    const jqueryUIUiDir = path.join('node_modules', 'jquery-ui', 'ui');

    /** - `raíz de jquery-ui en node_modules` */
    const jqueryUIDir = path.join('node_modules', 'jquery-ui');

    /** - `raíz publicable del core del navegador (SPEC 04)` */
    const jqSpaCoreRoot = config.framework?.jqSpaCore ?? 'packages/jq-spa-core/src';

    /** - `destino del framework en app/ para el import map` */
    const jqSpaCoreApp = config.framework?.jqSpaCoreApp ?? path.join(app, 'framework', 'jq-spa-core');

    /** - `raíz publicable del loading effect (SPEC 05)` */
    const spaLoadingEffectRoot = config.framework?.spaLoadingEffect ?? 'packages/spa-loading-effect/src';

    /** - `destino del loading effect en app/framework` */
    const spaLoadingEffectApp = config.framework?.spaLoadingEffectApp ?? path.join(app, 'framework', 'spa-loading-effect');

    //  -----  devolver el mapa de rutas del pipeline  -----
    return {

        srcRoot: src,

        appRoot: app,

        distRoot: dist,

        vendor: {

            jqueryDir: path.join('node_modules', 'jquery'),

            jqueryDistModuleDir,

            jqueryDistModule: jqueryModule,

            jqueryUIDir,

            jqueryUIUiDir,

            jqueryUIUi: config.vendor.jqueryUiWidgets,

        },

        packages: {

            spaServerSiteBaseFile: config.siteBase.packageFile,

            spaServerSiteBaseDir: path.dirname(config.siteBase.packageFile),

        },

        src: {

            assetsDir: path.join(src, 'assets'),

            assets: path.posix.join(src, 'assets', '**/*'),

            claseImagesPng: config.convertImages.pngGlob,

            configDir: config.siteBase.srcReexportDir,

            config: path.posix.join(config.siteBase.srcReexportDir, '**/*'),

            componentsDir: path.join(src, 'components'),

            components: path.posix.join(src, 'components', '**/*'),

            fontsDir: path.join(src, 'fonts'),

            fonts: path.posix.join(src, 'fonts', '**/*'),

            libsDir: path.join(src, 'libs'),

            libs: path.posix.join(src, 'libs', '**/*'),

            markdownShikiDir,

            markdownShiki: path.posix.join(markdownShikiDir, '**/*'),

            pagesDir: path.join(src, 'pages'),

            pages: path.posix.join(src, 'pages', '**/*'),

            pagesComponentsDir: path.join(src, 'pages-components'),

            pagesComponents: path.posix.join(src, 'pages-components', '**/*'),

            pdfsDir: path.join(src, 'pdfs'),

            pdfs: path.posix.join(src, 'pdfs', '**/*'),

            pluginsDir: path.join(src, 'plugins'),

            plugins: path.posix.join(src, 'plugins', '**/*'),

            routesDir: path.join(src, 'routes'),

            routes: path.posix.join(src, 'routes', '**/*'),

            spaDir: path.join(src, 'spa'),

            spa: path.posix.join(src, 'spa', '**/*'),

            servicesDir: path.join(src, 'services'),

            services: path.posix.join(src, 'services', '**/*.{php,js,json,sql,html}'),

            scriptsDir: path.join(src, 'scripts'),

            scripts: path.posix.join(src, 'scripts', '**/*.js'),

            scriptsNoMap: '!' + path.posix.join(src, 'scripts', '**/*.map'),

            main: path.posix.join(src, 'main.js'),

            scssGlobals: path.posix.join(src, 'scss', 'globals.scss'),

            scssPagesDir: path.join(src, 'scss', 'pages'),

            scssPages: path.posix.join(src, 'scss', 'pages', '**/*.scss'),

            scssAll: path.posix.join(src, 'scss', '**/*.scss'),

        },

        jqSpaCore: {

            root: jqSpaCoreRoot,

            appDir: jqSpaCoreApp,

            publish: path.posix.join(jqSpaCoreRoot, '**/*'),

            libsDir: path.join(jqSpaCoreRoot, 'libs'),

            libs: path.posix.join(jqSpaCoreRoot, 'libs', '**/*'),

            pluginsDir: path.join(jqSpaCoreRoot, 'plugins'),

            plugins: path.posix.join(jqSpaCoreRoot, 'plugins', '**/*'),

            vendorJqueryDest: path.posix.join(jqSpaCoreApp, 'libs', 'jquery-module', 'jquery'),

            vendorJqueryUiDest: path.posix.join(jqSpaCoreApp, 'libs', 'jquery-module', 'jquery-ui'),

        },

        spaLoadingEffect: {

            root: spaLoadingEffectRoot,

            appDir: spaLoadingEffectApp,

            publish: path.posix.join(spaLoadingEffectRoot, '**/*'),

        },

        app: {

            html: path.posix.join(app, '**/*.html'),

            css: path.posix.join(app, '**/*.css'),

            js: path.posix.join(app, '**/*.js'),

            jsNoMap: '!' + path.posix.join(app, '**/*.map'),

            php: path.posix.join(app, '**/*.php'),

        },

    };

};