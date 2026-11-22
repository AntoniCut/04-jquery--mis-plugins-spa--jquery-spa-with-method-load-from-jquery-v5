/*
    *  -------------------------------------------------------  *
    *  -----  gulp-task.d.js  --  /types/gulp-task.d.js  -----  *
    *  -------------------------------------------------------  *
*/


/**
 * -------------------------------
 * -----  `CopyTaskOptions`  -----
 * -------------------------------
 * @typedef {Object} CopyTaskOptions - Origen, destino y opciones de una tarea de copia.
 * @property {string | string[]} glob - Glob o globs de origen.
 * @property {string} checkPath - Ruta que debe existir antes de copiar.
 * @property {string} [base] - Base de gulp.src. Por defecto paths.srcRoot.
 * @property {string} [destDir] - Directorio destino. Por defecto paths.appRoot.
 * @property {boolean} [binary] - Lee el archivo sin codificación de texto.
 * @property {boolean} [isFile] - checkPath es un archivo, no un directorio.
 * @property {string | string[]} [exclude] - Globs que no se copian.
 */


/**
 * -----------------------------
 * -----  `ImageAvifSize`  -----
 * -----------------------------
 * @typedef {Object} ImageAvifSize - Tamaños AVIF generados por cada PNG.
 * @property {number} width - Ancho máximo de salida.
 * @property {number} height - Alto máximo de salida.
 */
