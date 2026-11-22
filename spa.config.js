/*
    *  -------------------------------------------------------  *
    *  -----  spa.config.js  --  /spa.config.js  -----  *
    *  -------------------------------------------------------  *
*/



//  -----  tipos del config de spa-build  -----
/// <reference path="./types/spa-build-config.d.js" />



/**
 * -------------------------
 * -----  `jqueryUiWidgets`  -----
 * -------------------------
 * - Módulos de jQuery UI que Gulp copia a app/libs (misma lista que paths.vendor del gulpfile).
 */
const jqueryUiWidgets = [
    'node_modules/jquery-ui/ui/version.js',
    'node_modules/jquery-ui/ui/widget.js',
    'node_modules/jquery-ui/ui/data.js',
    'node_modules/jquery-ui/ui/plugin.js',
    'node_modules/jquery-ui/ui/scroll-parent.js',
    'node_modules/jquery-ui/ui/keycode.js',
    'node_modules/jquery-ui/ui/position.js',
    'node_modules/jquery-ui/ui/unique-id.js',
    'node_modules/jquery-ui/ui/widgets/mouse.js',
    'node_modules/jquery-ui/ui/widgets/draggable.js',
    'node_modules/jquery-ui/ui/widgets/sortable.js',
    'node_modules/jquery-ui/ui/widgets/resizable.js',
    'node_modules/jquery-ui/ui/widgets/button.js',
    'node_modules/jquery-ui/ui/widgets/dialog.js',
    'node_modules/jquery-ui/ui/widgets/datepicker.js',
    'node_modules/jquery-ui/ui/widgets/tooltip.js',
];



/**
 * -----------------------------
 * -----  `spaBuildConfig`  -----
 * -----------------------------
 * @type {SpaBuildConfig}
 * - Valores por defecto del prototipo; @antonydev/spa-build los consumirá desde SPEC 03 paso 4.
 */
const spaBuildConfig = {

    dirs: {
        src: 'src',
        app: 'app',
        dist: 'dist',
        markdownShiki: 'src/markdown-shiki',
        routes: 'src/routes',
    },

    shiki: {
        theme: 'dark-plus',
        stripHeaderBanner: true,
        routeFilePattern: /^route-.*\.js$/,
        routeManifestFile: 'route-manifest.js',
    },

    siteBase: {
        packageFile: 'packages/spa-server/src/site-base.js',
        appConfigFile: 'app/config/site-base.js',
        srcReexportDir: 'src/config',
    },

    root: {
        indexHtml: 'index.html',
        htaccess: '.htaccess',
    },

    convertImages: {
        pngGlob: 'src/assets/img/clase-*/*.png',
    },

    vendor: {
        jqueryModule: 'node_modules/jquery/dist-module/jquery.module.min.js',
        jqueryUiWidgets,
    },

    framework: {
        jqSpaCore: 'packages/jq-spa-core/src',
        jqSpaCoreApp: 'app/framework/jq-spa-core',
        spaLoadingEffect: 'packages/spa-loading-effect/src',
        spaLoadingEffectApp: 'app/framework/spa-loading-effect',
    },

    extraCopy: [],

};



//  -----  exportar el config como default  -----
export default spaBuildConfig;