/*
    *  -------------------------------------------  *
    *  -----  gulpfile.js  --  /gulpfile.js  -----  *
    *  -------------------------------------------  *
*/



//  -----  carga .env antes que cualquier módulo que lea SITE_BASE  -----
import 'dotenv/config';

//  -----  configuración de build del desarrollador  -----
import spaConfig from './spa.config.js';

//  -----  registro de tareas del paquete spa-build  -----
import { registerGulp } from '@antonydev/spa-build/register-gulp.js';


/** - `tareas gulp registradas para este proyecto` */
const tasks = registerGulp({ projectRoot: process.cwd(), config: spaConfig });


//  -----  reexportar las tareas que usan los scripts de package.json  -----
export const {
    cleanDist,
    cleanApp,
    cleanMarkdownShiki,
    resetDev,
    clean,
    convertImages,
    copyAssets,
    copyConfig,
    copyComponents,
    copyFrameworkSpaLoadingEffect,
    copyFonts,
    copyLibs,
    copyMarkdownShiki,
    copyPages,
    copyPagesComponents,
    copyPdfs,
    copyPlugins,
    copyRoutes,
    copySpa,
    copyServices,
    copyMain,
    copyScripts,
    copyVendorJQuery,
    copyVendorJQueryUI,
    css,
    cssPages,
    styles,
    refresh,
    watchSrc,
    dev,
    watchStyles,
    minifyRootIndex,
    htaccessToDist,
    minifyHtml,
    minifyAllCss,
    minifyAllJs,
    minifyServices,
    copyStaticAssetsToDist,
    addTsNoCheck,
    build,
} = tasks;


//  -----  tarea por defecto de gulp  -----
export default build;