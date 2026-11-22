/*
    *  -----------------------------------------------------------------------  *
    *  -----  create-gulp-tasks.js  --  /packages/spa-build/src/create-gulp-tasks.js  -----  *
    *  -----------------------------------------------------------------------  *
*/


//  -----  tareas de gulp  -----
import gulp from 'gulp';

//  -----  compilador scss para gulp  -----
import gulpSass from 'gulp-sass';

//  -----  motor dart sass  -----
import * as dartSass from 'sass';

//  -----  ejecutar un proceso hijo  -----
import { exec } from 'node:child_process';

//  -----  borrar carpetas  -----
import { deleteAsync } from 'del';

//  -----  minificar javascript  -----
import terser from 'gulp-terser';

//  -----  minificar css  -----
import cleanCSS from 'gulp-clean-css';

//  -----  minificar html  -----
import htmlmin from 'gulp-htmlmin';

//  -----  stream de transformación  -----
import { Transform } from 'stream';

//  -----  evitar que un error del stream pare gulp  -----
import plumber from 'gulp-plumber';

//  -----  sistema de archivos  -----
import fs from 'fs';

//  -----  rutas de disco  -----
import path from 'node:path';

//  -----  convertir png a avif  -----
import sharp from 'sharp';

//  -----  generar el html resaltado con shiki  -----
import { generateMarkdownShiki } from './generate-markdown-shiki.js';

//  -----  mapa de rutas desde spa.config.js  -----
import { buildPaths } from './build-paths.js';

//  -----  base pública del sitio, leída de SITE_BASE  -----
import { base } from '@antonydev/spa-server/site-base.js';


//  -----  tipos de tareas gulp y vinyl  -----
/// <reference path="../../../types/gulp-task.d.js" />


/** - `métodos de gulp usados en las tareas` */
const { src, dest, watch, series, parallel } = gulp;


/** - `dart sass como motor de gulp-sass` */
const sass = gulpSass(dartSass);

/** - `opciones de Sass: registra site-base() para que los SCSS lean SITE_BASE` */
const sassOptions = {
    functions: {
        'site-base()': () => new dartSass.SassString(base),
    },
};



/**
 * ----------------------------------------
 * -----  `createGulpTasks(options)`  -----
 * ----------------------------------------
 * - Registra las tareas Gulp del sitio según spa.config.js.
 * @param {{ projectRoot: string, config: import('../../../types/spa-build-config.d.js').SpaBuildConfig }} options - Raíz del proyecto y configuración.
 * @return {Record<string, import('gulp').TaskFunction> & { build: import('gulp').TaskFunction }} - `Tareas exportadas por el gulpfile del proyecto`.
 */
export const createGulpTasks = ({ projectRoot, config }) => {

    /** - `rutas de origen y destino de las tareas` */
    const paths = buildPaths(config);

    /** - `shell del sitio en la raíz del proyecto` */
    const rootIndexHtml = config.root.indexHtml;

    /** - `reglas apache en la raíz del proyecto` */
    const rootHtaccess = config.root.htaccess;




/**
 * --------------------------------
 * -----  `WATCH_OPTIONS {}`  -----
 * --------------------------------
 * - Opciones de chokidar. El polling se activa con variables de entorno.
 */
const WATCH_OPTIONS = /** @type {import('gulp').WatchOptions} */ ({

    /** - `no lanzar las tareas al registrar el watcher` */
    ignoreInitial: true,

    /** - `usar polling si CHOKIDAR_USEPOLLING es true` */
    usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',

    /** - `intervalo de polling en milisegundos` */
    interval: Number(process.env.CHOKIDAR_INTERVAL || 250),

    /**
     * -----------------------------------
     * -----  `awaitWriteFinish {}`  -----
     * -----------------------------------
     * - Espera a que el archivo deje de cambiar antes de lanzar la tarea.
     */
    awaitWriteFinish: {

        /** - `milisegundos de estabilidad antes de disparar` */
        stabilityThreshold: 200,

        /** - `cada cuántos milisegundos se comprueba el archivo` */
        pollInterval: 100,

    },

});



/**
 * --------------------------
 * -----  `safePipe()`  -----
 * --------------------------
 * - Evita que un error del stream detenga Gulp.
 * @return {NodeJS.ReadWriteStream} - `'Stream' que registra el error y sigue`.
 */
const safePipe = () => {

    //  -----  envolver el stream con plumber  -----
    return plumber({

        /**
         * @param {Error} err - Fallo del stream.
         */
        errorHandler(err) {

            //  -----  escribir el error en consola  -----
            console.error(err.message);

            /** @type {NodeJS.ReadWriteStream} - `stream que plumber enlaza a this` */
            const stream = /** @type {NodeJS.ReadWriteStream} */ (this);

            //  -----  cerrar el stream para que la tarea siga  -----
            stream.emit('end');

        },

    });

};



/**
 * ---------------------------------------
 * -----  `validateFiles(taskName)`  -----
 * ---------------------------------------
 * - Avisa de archivos vacíos o streams y deja pasar el resto.
 * @param {string} taskName - Nombre de la tarea en el aviso.
 * @return {Transform} - `'Transform' que valida cada archivo del stream`.
 */
const validateFiles = (taskName) => {

    //  -----  crear el transform de validación  -----
    return new Transform({

        /** - `cada chunk es un archivo de vinyl, no un buffer` */
        objectMode: true,

        /**
         * @param {import('vinyl').Vinyl} file - Archivo del stream.
         * @param {BufferEncoding} _enc - Codificación, sin uso en modo objeto.
         * @param {import('stream').TransformCallback} cb - `'callback' para continuar el stream`.
         */
        transform(file, _enc, cb) {

            /** - `ruta del archivo relativa al proyecto` */
            const rel = path.relative(process.cwd(), file.path || '');

            //  -----  si es un directorio, dejarlo pasar  -----
            if (file.stat?.isDirectory?.()) {

                //  -----  devolver el directorio sin cambios  -----
                return cb(null, file);
            }

            //  -----  si el archivo está vacío, avisar  -----
            if (file.isNull()) {

                //  -----  escribir la advertencia  -----
                console.warn(`[${taskName}] Archivo vacío: ${rel}`);
            }

            //  -----  si el archivo llega como stream, avisar  -----
            if (file.isStream()) {

                //  -----  escribir la advertencia  -----
                console.warn(`[${taskName}] Stream no soportado: ${rel}`);
            }

            //  -----  dejar pasar el archivo  -----
            cb(null, file);

        },

    });

};



/**
 * ----------------------------------
 * -----  `existsDir(dirPath)`  -----
 * ----------------------------------
 * - Comprueba si un directorio existe en disco.
 * @param {string} dirPath - Ruta del directorio.
 * @return {boolean} - `'true' si la ruta existe`.
 */
const existsDir = (dirPath) => {

    //  -----  comprobar la ruta en disco  -----
    return fs.existsSync(dirPath);

};



/*
    *  ----------------------------------  *
    *  -----  limpieza de carpetas  -----  *
    *  ----------------------------------  *
*/



/**
 * ---------------------------
 * -----  `cleanDist()`  -----
 * ---------------------------
 * - Elimina la carpeta dist/ y su contenido.
 * @return {Promise<string[]>} - `'Rutas' eliminadas`.
 */
const cleanDist = () => deleteAsync([paths.distRoot]);



/**
 * --------------------------
 * -----  `cleanApp()`  -----
 * --------------------------
 * - Elimina la carpeta app/ y su contenido.
 * @return {Promise<string[]>} - Rutas eliminadas.
 */
const cleanApp = () => deleteAsync([paths.appRoot]);



/**
 * ------------------------------------
 * -----  `cleanMarkdownShiki()`  -----
 * ------------------------------------
 * - Elimina src/markdown-shiki/ para no dejar html de ejercicios borrados.
 * @return {Promise<string[]>} - Rutas eliminadas.
 */
const cleanMarkdownShiki = () => deleteAsync([paths.src.markdownShikiDir]);



/**
 * --------------------------
 * -----  `resetDev()`  -----
 * --------------------------
 * - Vacía app/ y src/markdown-shiki/ antes de volver a copiar.
 */
const resetDev = parallel(cleanApp, cleanMarkdownShiki);



/**
 * -----------------------
 * -----  `clean()`  -----
 * -----------------------
 * - Elimina en paralelo dist/, app/ y src/markdown-shiki/.
 */
const clean = parallel(cleanDist, cleanApp, cleanMarkdownShiki);



/*
    *  -------------------------------  *
    *  -----  fábrica de copias  -----  *
    *  -------------------------------  *
*/



/**
 * ------------------------------------------
 * -----  `createCopyTask(name, opts)`  -----
 * ------------------------------------------
 * - Crea una tarea de copia con validación. Si el origen no existe, no hace nada.
 * @param {string} name - Nombre visible de la tarea.
 * @param {CopyTaskOptions} opts - Origen, destino y opciones de lectura.
 * @return {import('gulp').TaskFunction} - `Tarea de copia`.
 */
const createCopyTask = (name, opts) => {

    /** - `tarea de copia` */
    const fn = () => {

        /** - `si el origen existe en disco` */
        const exists = opts.isFile ? fs.existsSync(opts.checkPath) : existsDir(opts.checkPath);

        //  -----  si el origen no existe, no copiar  -----
        if (!exists)
            //  -----  terminar la tarea sin copiar  -----
            return Promise.resolve();

        
        /** @type {string[]} - `globs de origen, con las exclusiones si las hay` */
        const globs = opts.exclude
            ? [opts.glob, opts.exclude].flat()
            : [opts.glob].flat();

        /** @type {{ base: string, allowEmpty: boolean, encoding?: false }} - `opciones de gulp.src` */
        const srcOpts = { base: opts.base ?? paths.srcRoot, allowEmpty: true };

        //  -----  si son binarios, leerlos sin codificar el texto  -----
        if (opts.binary) 
            //  -----  desactivar la codificación de texto  -----
            srcOpts.encoding = false;

        //  -----  copiar los archivos al destino  -----
        return src(globs, srcOpts)
            .pipe(safePipe())
            .pipe(validateFiles(name))
            .pipe(dest(opts.destDir ?? paths.appRoot));

    };

    //  -----  poner el nombre visible de la tarea  -----
    fn.displayName = name;
  
    //  -----  devolver la tarea de copia  -----
    return fn;

};



/*
    *  -----------------------------------  *
    *  -----  png de captura a avif  -----  *
    *  -----------------------------------  *
*/



/**
 * --------------------------------
 * -----  `AVIF_VARIANTS {}`  -----
 * --------------------------------
 * @type {ImageAvifSize[]} - `tamaños avif generados por cada png` */
const AVIF_VARIANTS = [
    { width: 280, height: 247 },
    { width: 560, height: 494 },
];



/**
 * -------------------------------------
 * -----  `listClasePngSources()`  -----
 * -------------------------------------
 * - Lista los PNG de captura en src/assets/img/clase-*, sin los AVIF ya generados.
 * @return {string[]} - `Rutas de los PNG de origen`.
 */
const listClasePngSources = () => {

    /** - `carpeta de imágenes` */
    const imgRoot = path.join(paths.src.assetsDir, 'img');

    //  -----  si no hay carpeta de imágenes, no hay capturas  -----
    if (!fs.existsSync(imgRoot))
        //  -----  devolver una lista vacía  -----
        return [];

    /** - `carpetas clase-*` */
    const classDirs = fs.readdirSync(imgRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('clase-'));

    /** @type {string[]} - `png de captura encontrados` */
    const files = [];

    //  -----  recorrer cada carpeta de clase  -----
    for (const classDir of classDirs) {

        /** - `ruta de la carpeta de clase` */
        const dirPath = path.join(imgRoot, classDir.name);

        /** - `nombres de archivo de la carpeta` */
        const names = fs.readdirSync(dirPath);

        //  -----  recorrer los archivos de la clase  -----
        for (const name of names) {

            //  -----  si no es png, saltarlo  -----
            if (!name.toLowerCase().endsWith('.png'))
                //  -----  pasar al siguiente archivo  -----
                continue;

            /** - `nombre sin la extensión png` */
            const base = name.slice(0, -4);

            //  -----  si ya es un derivado de tamaño, saltarlo  -----
            if (/-280x247$/.test(base) || /-560x494$/.test(base))
                //  -----  pasar al siguiente archivo  -----
                continue;

            //  -----  guardar el png de captura  -----
            files.push(path.join(dirPath, name));

        }

    }

    //  -----  devolver los png de captura  -----
    return files;

};



/**
 * --------------------------------------
 * -----  `getImageStem(fileName)`  -----
 * --------------------------------------
 * - Quita la extensión y el sufijo de tamaño del nombre del PNG.
 * @param {string} fileName - Nombre del archivo PNG.
 * @return {string} - `Nombre base para el AVIF`.
 */
const getImageStem = (fileName) => {

    /** - `nombre sin la extensión png` */
    const base = fileName.replace(/\.png$/i, '');

    /** - `nombre sin el sufijo de ancho y alto` */
    const stripped = base.replace(/-\d+x\d+$/, '');

    //  -----  devolver el nombre base, o el nombre sin extensión si el sufijo lo vació  -----
    return stripped || base;

};



/**
 * ------------------------------------------------------
 * -----  `shouldWriteAvif(inputPath, outputPath)`  -----
 * ------------------------------------------------------
 * - Regenera el AVIF si no existe o si el PNG es más nuevo.
 * @param {string} inputPath - PNG de origen.
 * @param {string} outputPath - AVIF de salida.
 * @return {boolean} - `'true' si hay que escribir el AVIF`.
 */
const shouldWriteAvif = (inputPath, outputPath) => {

    //  -----  si el avif no existe, hay que crearlo  -----
    if (!fs.existsSync(outputPath))
        //  -----  escribir el avif  -----
        return true;

    /** - `fecha del png` */
    const inputStat = fs.statSync(inputPath);

    /** - `fecha del avif` */
    const outputStat = fs.statSync(outputPath);

    //  -----  escribir el avif solo si el png es más nuevo  -----
    return inputStat.mtimeMs > outputStat.mtimeMs;

};



/**
 * --------------------------------------------------------------------
 * -----  `writeAvifImage(inputPath, outputPath, width, height)`  -----
 * --------------------------------------------------------------------
 * - Encaja el PNG completo en el recuadro, sin recortar, y lo escribe como AVIF.
 * 
 * `@async`
 * @param {string} inputPath - PNG de origen.
 * @param {string} outputPath - Ruta del AVIF de salida.
 * @param {number} width - Ancho máximo de salida.
 * @param {number} height - Alto máximo de salida.
 * @return {Promise<void>} - `Termina cuando el AVIF está escrito`.
 */
const writeAvifImage = async (inputPath, outputPath, width, height) => {

    //  -----  redimensionar el png y escribir el avif  -----
    await sharp(inputPath)
        .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .avif({ quality: 55 })
        .toFile(outputPath);
};



/**
 * -------------------------------
 * -----  `convertImages()`  -----
 * -------------------------------
 * - Genera dos AVIF por cada PNG de captura en clase-*.
 * 
 * `@async`
 * @return {Promise<void>} - `Termina cuando todos los AVIF pendientes están escritos`.
 */
const convertImages = async () => {

    /** - `png de captura` */
    const sources = listClasePngSources();

    //  -----  si no hay capturas, salir  -----
    if (sources.length === 0) {

        //  -----  avisar de que no hay png  -----
        console.log('ℹ️  No hay PNG en src/assets/img/clase-*');

        //  -----  terminar la tarea  -----
        return;
    }


    //  -----  recorrer cada png de captura  -----
    for (const inputPath of sources) {

        /** - `carpeta del png` */
        const destDir = path.dirname(inputPath);

        /** - `nombre base del avif` */
        const stem = getImageStem(path.basename(inputPath));

        //  -----  generar cada tamaño  -----
        for (const size of AVIF_VARIANTS) {

            /** - `ruta del avif de este tamaño` */
            const avifPath = path.join(
                destDir,
                `${stem}-${size.width}x${size.height}.avif`
            );

            //  -----  si el avif ya está al día, saltarlo  -----
            if (!shouldWriteAvif(inputPath, avifPath)) {

                //  -----  pasar al siguiente tamaño  -----
                continue;

            }

            //  -----  escribir el avif  -----
            await writeAvifImage(inputPath, avifPath, size.width, size.height);

            //  -----  confirmar el archivo escrito  -----
            console.log(`✅  ${avifPath}`);

        }

    }

};


//  -----  nombre visible de la tarea de imágenes  -----
convertImages.displayName = 'convertImages';


/*
    *  --------------------------------  *
    *  -----  copia de src a app  -----  *
    *  --------------------------------  *
*/



/**
 * -----------------------------
 * -----  `copyAssets()`  -----
 * -----------------------------
 * - Copia src/assets/ a app/assets/.
 */
const copyAssets = createCopyTask('copyAssets', { glob: paths.src.assets, checkPath: paths.src.assetsDir, binary: true });



/**
 * -----------------------------
 * -----  `copyConfig()`  -----
 * -----------------------------
 * - Copia site-base.js del paquete spa-server a app/config/ para el navegador.
 */
const copyConfig = createCopyTask('copyConfig', {
    glob: paths.packages.spaServerSiteBaseFile,
    checkPath: paths.packages.spaServerSiteBaseFile,
    isFile: true,
    base: paths.packages.spaServerSiteBaseDir,
    destDir: path.join(paths.appRoot, 'config'),
});



/**
 * --------------------------------
 * -----  `copyComponents()`  -----
 * --------------------------------
 * - Copia src/components/ a app/components/.
 */
const copyComponents = createCopyTask('copyComponents', { glob: paths.src.components, checkPath: paths.src.componentsDir });



/**
 * ----------------------------------------
 * -----  `copyFrameworkSpaLoadingEffect()`  -----
 * ----------------------------------------
 * - Copia packages/spa-loading-effect/src/ a app/framework/spa-loading-effect/ (SPEC 05).
 */
const copyFrameworkSpaLoadingEffect = createCopyTask('copyFrameworkSpaLoadingEffect', {
    glob: paths.spaLoadingEffect.publish,
    checkPath: paths.spaLoadingEffect.root,
    base: paths.spaLoadingEffect.root,
    destDir: paths.spaLoadingEffect.appDir,
});



/**
 * ---------------------------
 * -----  `copyFonts()`  -----
 * ---------------------------
 * - Copia src/fonts/ a app/fonts/.
 */
const copyFonts = createCopyTask('copyFonts', { glob: paths.src.fonts, checkPath: paths.src.fontsDir, binary: true });



/**
 * --------------------------
 * -----  `copyLibs()`  -----
 * --------------------------
 * - Copia packages/jq-spa-core/src/ a app/framework/jq-spa-core/ (SPEC 04 paso 4).
 */
const copyFrameworkJqSpaCore = createCopyTask('copyFrameworkJqSpaCore', {
    glob: paths.jqSpaCore.publish,
    checkPath: paths.jqSpaCore.root,
    base: paths.jqSpaCore.root,
    destDir: paths.jqSpaCore.appDir,
    binary: true,
});



/**
 * -----------------------------------
 * -----  `copyMarkdownShiki()`  -----
 * -----------------------------------
 * - Copia src/markdown-shiki/ a app/markdown-shiki/.
 */
const copyMarkdownShiki = createCopyTask('copyMarkdownShiki', { glob: paths.src.markdownShiki, checkPath: paths.src.markdownShikiDir });



/**
 * ---------------------------
 * -----  `copyPages()`  -----
 * ---------------------------
 * - Copia src/pages/ a app/pages/.
 */
const copyPages = createCopyTask('copyPages', { glob: paths.src.pages, checkPath: paths.src.pagesDir });



/**
 * -------------------------------------
 * -----  `copyPagesComponents()`  -----
 * -------------------------------------
 * - Copia src/pages-components/ a app/pages-components/.
 */
const copyPagesComponents = createCopyTask('copyPagesComponents', { glob: paths.src.pagesComponents, checkPath: paths.src.pagesComponentsDir });



/**
 * --------------------------
 * -----  `copyPdfs()`  -----
 * --------------------------
 * - Copia src/pdfs/ a app/pdfs/.
 */
const copyPdfs = createCopyTask('copyPdfs', { glob: paths.src.pdfs, checkPath: paths.src.pdfsDir, binary: true });



/**
 * -----------------------------
 * -----  `copyPlugins()`  -----
 * -----------------------------
 * - Copia src/plugins/ a app/plugins/.
 */
const copyPlugins = createCopyTask('copyPlugins', { glob: paths.src.plugins, checkPath: paths.src.pluginsDir });



/**
 * ----------------------------
 * -----  `copyRoutes()`  -----
 * ----------------------------
 * - Copia src/routes/ a app/routes/.
 */
const copyRoutes = createCopyTask('copyRoutes', { glob: paths.src.routes, checkPath: paths.src.routesDir });



/**
 * -------------------------
 * -----  `copySpa()`  -----
 * -------------------------
 * - Copia src/spa/ a app/spa/.
 */
const copySpa = createCopyTask('copySpa', { glob: paths.src.spa, checkPath: paths.src.spaDir });



/**
 * ------------------------------
 * -----  `copyServices()`  -----
 * ------------------------------
 * - Copia src/services/ a app/services/.
 */
const copyServices = createCopyTask('copyServices', { glob: paths.src.services, checkPath: paths.src.servicesDir });



/**
 * --------------------------
 * -----  `copyMain()`  -----
 * --------------------------
 * - Copia src/main.js a app/main.js.
 */
const copyMain = createCopyTask('copyMain', {
    glob: paths.src.main,
    checkPath: paths.src.main,
    isFile: true,
});



/**
 * -----------------------------
 * -----  `copyScripts()`  -----
 * -----------------------------
 * - Copia src/scripts/ a app/js/, sin los source maps.
 */
const copyScripts = createCopyTask('copyScripts', {
    glob: paths.src.scripts,
    checkPath: paths.src.scriptsDir,
    base: paths.src.scriptsDir,
    destDir: path.posix.join(paths.appRoot, 'js'),
    exclude: paths.src.scriptsNoMap,
});



/**
 * ----------------------------------
 * -----  `copyVendorJQuery()`  -----
 * ----------------------------------
 * - Copia el módulo minificado de jQuery al árbol framework/jq-spa-core.
 */
const copyVendorJQuery = createCopyTask('copyVendorJQuery', {
    glob: paths.vendor.jqueryDistModule,
    checkPath: paths.vendor.jqueryDistModuleDir,
    base: paths.vendor.jqueryDistModuleDir,
    destDir: paths.jqSpaCore.vendorJqueryDest,
});



/**
 * ------------------------------------
 * -----  `copyVendorJQueryUI()`  -----
 * ------------------------------------
 * - Copia los módulos jQuery UI usados al árbol framework/jq-spa-core.
 */
const copyVendorJQueryUI = createCopyTask('copyVendorJQueryUI', {
    glob: paths.vendor.jqueryUIUi,
    checkPath: paths.vendor.jqueryUIUiDir,
    base: paths.vendor.jqueryUIDir,
    destDir: paths.jqSpaCore.vendorJqueryUiDest,
});



/**
 * -----------------------------------
 * -----  `copyVendorModules()`  -----
 * -----------------------------------
 * - Copia los módulos de vendor que se importan en el navegador.
 */
const copyVendorModules = parallel(copyVendorJQuery, copyVendorJQueryUI);



/**
 * ------------------------------------
 * -----  `phpMinifyTransform()`  -----
 * ------------------------------------
 * - Quita comentarios PHP y colapsa espacios. No toca strings ni heredocs.
 * @return {Transform} - Transform que reescribe el PHP.
 */
const phpMinifyTransform = () => {

    //  -----  crear el transform de minificado php  -----
    return new Transform({

        /** - `cada chunk es un archivo de vinyl` */
        objectMode: true,

        /**
         * @param {import('vinyl').Vinyl} file - Archivo PHP del stream.
         * @param {BufferEncoding} _enc - Codificación, sin uso en modo objeto.
         * @param {import('stream').TransformCallback} cb - `'callback' para continuar el stream`.
         */
        transform(file, _enc, cb) {

            //  -----  si está vacío o es un directorio, dejarlo pasar  -----
            if (file.isNull() || file.stat?.isDirectory?.())
                //  -----  devolver el archivo sin cambios  -----
                return cb(null, file);

            //  -----  si el contenido es un buffer, minificar el php  -----
            if (file.isBuffer() && file.contents) {

                /** @type {string} - `php leído del archivo` */
                let content = file.contents.toString('utf8');

                //  -----  quitar comentarios de bloque  -----
                content = content.replace(/\/\*[\s\S]*?\*\//g, '');

                //  -----  quitar comentarios de línea  -----
                content = content.replace(/^\s*\/\/.*$/gm, '');

                //  -----  colapsar espacios y líneas vacías  -----
                content = content.split('\n').map((line) => line.trim()).filter(Boolean).join('\n');

                //  -----  guardar el php minificado  -----
                file.contents = Buffer.from(content, 'utf8');

            }

            //  -----  dejar pasar el archivo  -----
            cb(null, file);

        },

    });

};



/*
    *  ------------------------------  *
    *  -----  compilación scss  -----  *
    *  ------------------------------  *
*/



/** - `escribe el source map junto al css, en un archivo .css.map` */
const CSS_SOURCEMAPS = '.';



/**
 * ---------------------
 * -----  `css()`  -----
 * ---------------------
 * - Compila src/scss/globals.scss a app/css/globals.css y su source map.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de compilación, o una promesa vacía si no hay scss`.
 */
const css = () => {

    //  -----  si no existe globals.scss, no compilar  -----
    if (!fs.existsSync(paths.src.scssGlobals)) 
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  compilar globals.scss a app/css  -----
    return src(paths.src.scssGlobals, { sourcemaps: true, allowEmpty: true })
        .pipe(safePipe())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(validateFiles('css'))
        .pipe(dest(path.posix.join(paths.appRoot, 'css'), { sourcemaps: CSS_SOURCEMAPS }));

};



/**
 * --------------------------
 * -----  `cssPages()`  -----
 * --------------------------
 * - Compila src/scss/pages/*.scss a app/css/pages/ y sus source maps.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de compilación, o una promesa vacía si no hay carpeta`.
 */
const cssPages = () => {

    //  -----  si no hay carpeta de páginas scss, no compilar  -----
    if (!existsDir(paths.src.scssPagesDir)) 
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  compilar los scss de páginas  -----
    return src(paths.src.scssPages, { base: paths.src.scssPagesDir, sourcemaps: true })
        .pipe(safePipe())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(validateFiles('cssPages'))
        .pipe(dest(path.posix.join(paths.appRoot, 'css', 'pages'), { sourcemaps: CSS_SOURCEMAPS }));

};



/**
 * ------------------------
 * -----  `styles()`  -----
 * ------------------------
 * - Compila el scss global y el de páginas en paralelo.
 */
const styles = parallel(css, cssPages);



/*
    *  ---------------------------------  *
    *  -----  copia y compilación  -----  *
    *  ---------------------------------  *
*/



/**
 * -------------------------------
 * -----  `generateShiki()`  -----
 * -------------------------------
 * - Genera el HTML de Shiki en src/markdown-shiki/ después de compilar el SCSS y antes de copiarlo a app/.
 * 
 * `@async`
 * @return {Promise<void>} - `Termina cuando los bloques están generados`.
 */
const generateShiki = async () => {

    //  -----  generar los bloques html de shiki  -----
    await generateMarkdownShiki({ projectRoot, config });

};


//  -----  nombre visible de la tarea de shiki  -----
generateShiki.displayName = 'generateShiki';



/**
 * ------------------------------
 * -----  `buildSources()`  -----
 * ------------------------------
 * - Copia los fuentes y compila el SCSS en paralelo. El HTML de Shiki se copia después.
 */
const buildSources = parallel(
    copyAssets,
    copyConfig,
    copyComponents,
    copyFonts,
    copyFrameworkJqSpaCore,
    copyFrameworkSpaLoadingEffect,
    copyVendorModules,
    copyPages,
    copyPagesComponents,
    copyPdfs,
    copyPlugins,
    copyRoutes,
    copySpa,
    copyServices,
    copyScripts,
    copyMain,
    styles,
);



/**
 * -------------------------
 * -----  `copyAll()`  -----
 * -------------------------
 * - Convierte imágenes, copia y compila, genera Shiki y copia ese HTML a app/.
 */
const copyAll = series(
    convertImages,
    buildSources,
    generateShiki,
    copyMarkdownShiki,
);



/**
 * -------------------------
 * -----  `refresh()`  -----
 * -------------------------
 * - Vacía los destinos y vuelve a copiar y compilar src/ hacia app/, sin quedar a la escucha.
 */
const refresh = series(resetDev, copyAll);



/*
    *  --------------------------  *
    *  -----  observadores  -----  *
    *  --------------------------  *
*/



/**
 * ---------------------------
 * -----  `watchTask()`  -----
 * ---------------------------
 * - Observa src/ y relanza la tarea que corresponde a cada cambio.
 */
const watchTask = () => {

    /** @type {Array<[string | string[], import('gulp').TaskFunction]>} - `glob y tarea de cada observador` */
    const watchers = [
        [paths.src.assets, copyAssets],
        [[paths.packages.spaServerSiteBaseFile, paths.src.config], copyConfig],
        [paths.src.components, copyComponents],
        [paths.src.fonts, copyFonts],
        [paths.spaLoadingEffect.publish, copyFrameworkSpaLoadingEffect],
        [paths.jqSpaCore.publish, copyFrameworkJqSpaCore],
        [['package.json', 'pnpm-lock.yaml'], copyVendorModules],
        [paths.src.markdownShiki, copyMarkdownShiki],
        [paths.src.pages, copyPages],
        [paths.src.pagesComponents, copyPagesComponents],
        [paths.src.pdfs, copyPdfs],
        [paths.src.plugins, copyPlugins],
        [paths.src.routes, copyRoutes],
        [paths.src.spa, copySpa],
        [paths.src.services, copyServices],
        [paths.src.scripts, copyScripts],
        [paths.src.main, copyMain],
        [paths.src.scssAll, series(styles, generateShiki, copyMarkdownShiki)],
        [paths.src.claseImagesPng, convertImages],
    ];

    //  -----  registrar cada observador  -----
    for (const [glob, task] of watchers) {

        //  -----  observar el glob y lanzar su tarea  -----
        watch(glob, WATCH_OPTIONS, task);
    }

};



//  -----  nombre visible del observador  -----
watchTask.displayName = 'watch';



/**
 * --------------------------
 * -----  `watchSrc()`  -----
 * --------------------------
 * - Solo observa src/. El vaciado y la copia inicial van en refresh y en dev.
 */
const watchSrc = () => watchTask();



//  -----  nombre visible de watchSrc  -----
watchSrc.displayName = 'watchSrc';



/**
 * ---------------------
 * -----  `dev()`  -----
 * ---------------------
 * - Vacía los destinos, genera app/ y queda escuchando. El servidor se levanta con pnpm run server.
 */
const dev = series(resetDev, copyAll, watchTask);



/**
 * -----------------------------
 * -----  `watchStyles()`  -----
 * -----------------------------
 * - Observa solo los SCSS y recompila los estilos.
 * @return {ReturnType<typeof watch>} - `Observador de los SCSS`.
 */
const watchStyles = () => watch(paths.src.scssAll, WATCH_OPTIONS, styles);



/*
    *  -------------------------------  *
    *  -----  minificado a dist  -----  *
    *  -------------------------------  *
*/



/**
 * ---------------------------------
 * -----  `replaceSiteBase()`  -----
 * ---------------------------------
 * - Crea un Transform que sustituye el marcador %SITE_BASE% por la base del .env.
 * @return {Transform} - `Stream que reescribe el marcador`.
 */
const replaceSiteBase = () => new Transform({

    /** - `cada chunk es un archivo de vinyl` */
    objectMode: true,

    /**
     * @param {import('vinyl').Vinyl} file - Archivo del stream.
     * @param {BufferEncoding} _enc - Codificación, sin uso en modo objeto.
     * @param {import('stream').TransformCallback} cb - Callback para continuar el stream.
     */
    transform(file, _enc, cb) {

        //  -----  solo procesa archivos con contenido  -----
        if (file.isBuffer() && file.contents) {

            //  -----  reemplaza todas las apariciones del marcador  -----
            file.contents = Buffer.from(file.contents.toString('utf-8').replaceAll('%SITE_BASE%', base));
        }

        //  -----  pasa el archivo al siguiente paso  -----
        cb(null, file);
    },
});



/**
 * ---------------------------------
 * -----  `minifyRootIndex()`  -----
 * ---------------------------------
 * - Minifica index.html de la raíz hacia dist/index.html, con la base sustituida.
 * @return {NodeJS.ReadWriteStream} - `Stream de minificado`.
 */
const minifyRootIndex = () => {

    //  -----  leer index.html, sustituir la base, minificar y escribir en dist/  -----
    return src(rootIndexHtml, { allowEmpty: true })
        .pipe(safePipe())
        .pipe(replaceSiteBase())
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(validateFiles('minifyRootIndex'))
        .pipe(dest(paths.distRoot));
};



/**
 * --------------------------------
 * -----  `htaccessToDist()`  -----
 * --------------------------------
 * - Copia .htaccess de la raíz hacia dist/.htaccess con la base del .env.
 * @return {NodeJS.ReadWriteStream} - `Stream de copia`.
 */
const htaccessToDist = () => {

    //  -----  leer .htaccess, sustituir la base y escribir en dist/  -----
    return src(rootHtaccess, { allowEmpty: true, dot: true })
        .pipe(safePipe())
        .pipe(replaceSiteBase())
        .pipe(validateFiles('htaccessToDist'))
        .pipe(dest(paths.distRoot));
};



/**
 * ----------------------------
 * -----  `minifyHtml()`  -----
 * ----------------------------
 * - Minifica el HTML de app/ hacia dist/.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de minificado, o una promesa vacía si no hay app/`.
 */
const minifyHtml = () => {

    //  -----  si no hay app, no minificar  -----
    if (!existsDir(paths.appRoot)) 
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  minificar el html de app  -----
    return src(paths.app.html, { base: '.', allowEmpty: true })
        .pipe(safePipe())
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(validateFiles('minifyHtml'))
        .pipe(dest(paths.distRoot));
};



/**
 * ------------------------------
 * -----  `minifyAllCss()`  -----
 * ------------------------------
 * - Minifica el CSS de app/ hacia dist/.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de minificado, o una promesa vacía si no hay app/`.
 */
const minifyAllCss = () => {

    //  -----  si no hay app, no minificar  -----
    if (!existsDir(paths.appRoot))
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  minificar el css de app  -----
    return src(paths.app.css, { base: '.', allowEmpty: true })
        .pipe(safePipe())
        .pipe(cleanCSS())
        .pipe(validateFiles('minifyAllCss'))
        .pipe(dest(paths.distRoot));
};



/**
 * -----------------------------
 * -----  `minifyAllJs()`  -----
 * -----------------------------
 * - Minifica el JavaScript de app/ hacia dist/, sin los source maps.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de minificado, o una promesa vacía si no hay app/`.
 */
const minifyAllJs = () => {

    //  -----  si no hay app, no minificar  -----
    if (!existsDir(paths.appRoot)) 
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  minificar el javascript de app  -----
    return src([paths.app.js, paths.app.jsNoMap], { base: '.', allowEmpty: true })
        .pipe(safePipe())
        .pipe(terser())
        .pipe(validateFiles('minifyAllJs'))
        .pipe(dest(paths.distRoot));
};



/**
 * --------------------------------
 * -----  `minifyServices()`  -----
 * --------------------------------
 * - Minifica el PHP de app/ hacia dist/.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de minificado, o una promesa vacía si no hay app/`.
 */
const minifyServices = () => {

    //  -----  si no hay app, no minificar  -----
    if (!existsDir(paths.appRoot)) 
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  minificar el php de app  -----
    return src(paths.app.php, { base: '.', allowEmpty: true })
        .pipe(safePipe())
        .pipe(phpMinifyTransform())
        .pipe(validateFiles('minifyServices'))
        .pipe(dest(paths.distRoot));
};



/**
 * ----------------------------------------
 * -----  `copyStaticAssetsToDist()`  -----
 * ----------------------------------------
 * - Copia a dist/ los estáticos de app/ que no son HTML, CSS, JS, PHP ni source maps.
 * @return {NodeJS.ReadWriteStream | Promise<void>} - `Stream de copia, o una promesa vacía si no hay app/`.
 */
const copyStaticAssetsToDist = () => {

    //  -----  si no hay app, no copiar  -----
    if (!existsDir(paths.appRoot)) 
        //  -----  terminar sin hacer nada  -----
        return Promise.resolve();

    //  -----  copiar los estáticos de app a dist  -----
    return src([
        path.posix.join(paths.appRoot, '**/*'),
        '!' + paths.app.html,
        '!' + paths.app.css,
        '!' + paths.app.js,
        '!' + paths.app.php,
        '!' + path.posix.join(paths.appRoot, '**/*.map'),
    ], { base: '.', allowEmpty: true, encoding: false })
        .pipe(safePipe())
        .pipe(validateFiles('copyStaticAssetsToDist'))
        .pipe(dest(paths.distRoot));
};



/**
 * --------------------------------
 * -----  `addTsNoCheck(cb)`  -----
 * --------------------------------
 * - En development, inserta // @ts-nocheck al inicio de los JS de desarrollo.
 * @param {(err?: Error | null) => void} cb - Callback con el que Gulp cierra la tarea.
 */
const addTsNoCheck = (cb) => {

    //  -----  fuera de development, no tocar los archivos  -----
    if (process.env.NODE_ENV !== 'development') {

        //  -----  avisar a gulp de que la tarea terminó  -----
        cb();

        //  -----  salir de la tarea  -----
        return;
    }

    //  -----  ejecutar el script que inserta ts-nocheck  -----
    exec(`node ${path.join(projectRoot, 'addTsNoCheck.js')}`, (err, stdout, stderr) => {

        //  -----  si el script falla, devolver el error a gulp  -----
        if (err) {

            //  -----  escribir el error en consola  -----
            console.error(err);

            //  -----  terminar la tarea con error  -----
            cb(err);

            //  -----  salir del callback  -----
            return;

        }

        //  -----  si hay salida estándar, mostrarla  -----
        if (stdout) 
            //  -----  escribir la salida en consola  -----
            console.log(stdout);

        
        //  -----  si hay salida de error, mostrarla  -----
        if (stderr)
            //  -----  escribir la salida de error en consola  -----
            console.error(stderr);


        //  -----  avisar a gulp de que la tarea terminó  -----
        cb();

    });

};



//  -----  nombre visible de la tarea ts-nocheck  -----
addTsNoCheck.displayName = 'addTsNoCheck';



/**
 * -----------------------
 * -----  `build()`  -----
 * -----------------------
 * - Build de producción: limpia, copia y compila src/ hacia app/, y minifica app/ hacia dist/.
 */
const build = series(
    parallel(cleanDist, cleanApp, cleanMarkdownShiki),
    copyAll,
    parallel(minifyAllJs, minifyAllCss, minifyRootIndex, htaccessToDist, minifyHtml, minifyServices, copyStaticAssetsToDist),
);



    //  -----  devolver el mapa de tareas para el gulpfile del proyecto  -----
    return {
        cleanDist,
        cleanApp,
        cleanMarkdownShiki,
        resetDev,
        clean,
        convertImages,
        copyAssets,
        copyConfig,
        copyComponents,
        copyFonts,
        copyFrameworkJqSpaCore,
        copyFrameworkSpaLoadingEffect,
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
    };

};
