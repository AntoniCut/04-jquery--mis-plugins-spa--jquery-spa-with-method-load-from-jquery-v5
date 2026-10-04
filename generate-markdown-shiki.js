/*
    *  -------------------------------------------------------------------------  *
    *  -----  generate-markdown-shiki.js  --  /generate-markdown-shiki.js  -----  *
    *  -------------------------------------------------------------------------  *
*/



/*
    Lee las entradas MarkdownShikiHtml de cada ruta y genera los bloques HTML
    resaltados con Shiki en src/markdown-shiki/ (gulp copia luego el resultado
    a app/markdown-shiki/).

    Cada entrada del contrato MarkdownShikiEntry indica:
      - fileName:      nombre del .html a generar.
      - fileExtension: tipo/lenguaje a resaltar ('html' | 'css' | 'scss' | 'js').
      - urlInput:      URL (con base) del archivo fuente a renderizar (debe existir).
      - urlOutput:     URL (con base) de la CARPETA donde se guarda el .html generado.
      - target:        selector CSS destino (informativo).

    El bloque se guarda en: src/markdown-shiki/<relOutput>/<fileName>
    donde <relOutput> se deriva de urlOutput (lo posterior a 'markdown-shiki/').

    Uso: pnpm code-highlight
*/


//  -----  convertir código a html con shiki  -----
import { codeToHtml } from 'shiki';

//  -----  leer y escribir archivos  -----
import { 
    readFileSync, 
    writeFileSync, 
    mkdirSync, 
    existsSync, 
    readdirSync 
} from 'node:fs';

//  -----  unir y recortar rutas  -----
import { join, dirname } from 'node:path';

//  -----  ruta de este módulo  -----
import { fileURLToPath } from 'node:url';


/** @type {string} - `base del proyecto, la misma que en src/main.js` */
const base = '/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5';


/** 
 * --------------------------------
 * -----  type `RouteModule`  -----
 * --------------------------------
 *  - `Módulo de ruta: cada export es una Route`
 * @typedef {Record<string, Route>} RouteModule 
 */


/**
 * -----------------------------------
 * -----  type `ShikiGenResult`  -----
 * -----------------------------------
 * - Resultado de la generación de un bloque markdown shiki.
 * @typedef {Object} ShikiGenResult
 * @property {'generated' | 'skipped'} status - `si el bloque se escribió o se omitió`
 * @property {string} message - `texto que se muestra en consola`
 */


/** - `directorio de este script` */
const __dirname = dirname(fileURLToPath(import.meta.url));

/** - `ruta absoluta de este script` */
const __filename = fileURLToPath(import.meta.url);

/** - `marca que separa la carpeta de salida en la url` */
const MARKER = 'markdown-shiki/';

/** - `tema de shiki para el resaltado` */
const SHIKI_THEME = 'dark-plus';

/** - `quitar el banner del inicio del fuente antes de resaltar` */
const STRIP_HEADER_BANNER = true;

/** - `patrón que marca un comentario banner` */
const BANNER_PATTERN = /-----/;



/**
 * --------------------------------------
 * -----  `mapLang(fileExtension)`  -----
 * --------------------------------------
 * - Traduce la extensión del archivo al lenguaje de Shiki.
 * @param {string} fileExtension - Extensión declarada en la entrada.
 * @return {string | null} - `Lenguaje de Shiki, o null si no está soportada`.
 */
const mapLang = (fileExtension) => {

    /** - `extensión en minúsculas` */
    const ext = String(fileExtension).toLowerCase();

    //  -----  si es html, usar el lenguaje html  -----
    if (ext === 'html') {
        //  -----  devolver html  -----
        return 'html';
    }

    //  -----  si es css, usar el lenguaje css  -----
    if (ext === 'css') {
        //  -----  devolver css  -----
        return 'css';
    }

    //  -----  si es scss, usar el lenguaje scss  -----
    if (ext === 'scss') {
        //  -----  devolver scss  -----
        return 'scss';
    }

    //  -----  si es javascript, usar el lenguaje javascript  -----
    if (ext === 'js' || ext === 'javascript') {
        //  -----  devolver javascript  -----
        return 'javascript';
    }

    //  -----  extensión no soportada por shiki en este script  -----
    return null;

};



/**
 * ------------------------------
 * -----  `urlToDisk(url)`  -----
 * ------------------------------
 * - Convierte una URL con base en una ruta absoluta de disco.
 * @param {string} url - URL del archivo, con la base del proyecto.
 * @return {string} - `Ruta absoluta en disco`.
 */
const urlToDisk = (url) => {

    /** - `ruta relativa al proyecto` */
    const rel = url.startsWith(base) ? url.slice(base.length) : url;

    //  -----  unir la ruta relativa con el directorio del script  -----
    return join(__dirname, rel);

};



/**
 * ------------------------------------------
 * -----  `deriveOutputDir(urlOutput)`  -----
 * ------------------------------------------
 * - Obtiene la carpeta relativa de salida dentro de src/markdown-shiki/.
 * @param {string} urlOutput - URL de la carpeta de salida, con la base del proyecto.
 * @return {string | null} - `Ruta relativa tras markdown-shiki/, o null si no aparece`.
 */
const deriveOutputDir = (urlOutput) => {

    /** - `posición de markdown-shiki/ en la url` */
    const idx = urlOutput.indexOf(MARKER);

    //  -----  si la url no apunta a markdown-shiki, no hay salida  -----
    if (idx === -1) {
        //  -----  devolver null  -----
        return null;
    }

    //  -----  devolver la carpeta relativa, sin barra final  -----
    return urlOutput.slice(idx + MARKER.length).replace(/\/$/, '');

};



/**
 * ---------------------------------------
 * -----  `stripHeaderBanner(code)`  -----
 * ---------------------------------------
 * - Quita el comentario banner del inicio del código fuente.
 * @param {string} code - Código fuente leído del archivo.
 * @return {string} - `Código sin el banner inicial`.
 */
const stripHeaderBanner = (code) => {

    //  -----  quitar ts-nocheck y use strict del inicio  -----
    code = code.replace(/^(?:\/\/\s*@ts-nocheck\s*\n|"\s*use strict\s*"\s*;\s*\n)+/, '');

    /** - `comentario de bloque, html o de línea` */
    const ANY_COMMENT_RE = /\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/[^\n]*\n/g;

    /** - `inicio del primer banner, o -1` */
    let firstIdx = -1;
   
    /** - `fin del primer banner, o -1` */
    let firstEnd = -1;

    //  -----  buscar el primer comentario que sea un banner  -----
    for (const m of code.matchAll(ANY_COMMENT_RE)) {

        //  -----  si el comentario contiene el patrón de banner  -----
        if (BANNER_PATTERN.test(m[0])) {

            //  -----  guardar el inicio del banner  -----
            firstIdx = m.index ?? -1;

            //  -----  guardar el fin del banner  -----
            firstEnd = (m.index ?? 0) + m[0].length;

            //  -----  dejar de buscar  -----
            break;

        }

    }

    //  -----  si no hay banner, devolver el código igual  -----
    if (firstIdx === -1) {
        //  -----  devolver el código sin cambios  -----
        return code;
    }

    /** - `fin del bloque de banners seguidos` */
    let endIdx = firstEnd;

    /** - `comentario pegado al banner anterior` */
    const COMMENT_AFTER_BANNER_RE = /^\s*(?:\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/[^\n]*\n)/;

    //  -----  extender el corte mientras sigan banners  -----
    while (true) {

        /** - `texto que queda tras el corte` */
        const rest = code.slice(endIdx);

        /** @type {RegExpMatchArray | null} - `comentario inmediato, si lo hay` */
        const match = rest.match(COMMENT_AFTER_BANNER_RE);

        //  -----  si no hay otro comentario, parar  -----
        if (!match) {
            //  -----  salir del bucle  -----
            break;
        }

        //  -----  si el comentario no es un banner, parar  -----
        if (!BANNER_PATTERN.test(match[0])) {
            //  -----  salir del bucle  -----
            break;
        }

        //  -----  incluir este banner en el corte  -----
        endIdx += match[0].length;

    }

    /** - `código anterior al banner` */
    const before = code.slice(0, firstIdx);

    /** - `código posterior al banner, sin el salto inicial` */
    const after = code.slice(endIdx).replace(/^\s*\n/, '');

    //  -----  devolver el código sin el banner  -----
    return (before + after).replace(/^\s*\n/, '');

};



/**
 * ---------------------------------------
 * -----  `generateMarkdownShiki()`  -----
 * ---------------------------------------
 * - Genera los bloques HTML resaltados con Shiki en src/markdown-shiki/.
 * @return {Promise<{ generated: number, skipped: number }>} - `Cuántos bloques se generaron y cuántos se omitieron`.
 */
export const generateMarkdownShiki = async () => {

    /** - `carpeta de los módulos de ruta` */
    const routesDir = join(__dirname, 'src/routes');

    /** - `archivos de ruta, sin el manifiesto` */
    const routeFiles = readdirSync(routesDir).filter(
        (f) => f.startsWith('route-') && f.endsWith('.js') && f !== 'route-manifest.js'
    );

    /** @type {MarkdownShikiEntry[]} - `entradas shiki recogidas de las rutas` */
    const entries = [];

    //  -----  recorrer los módulos de ruta  -----
    for (const file of routeFiles) {

        /** @type {RouteModule} - `módulo de la ruta importado` */
        const mod = await import(`./src/routes/${file}`);

        /** @type {Route | undefined} - `ruta que declara bloques markdown shiki` */
        const route = Object.values(mod).find(
            (v) => v && typeof v === 'object' && Array.isArray(v.MarkdownShikiHtml)
        );

        //  -----  si la ruta trae entradas shiki, acumularlas  -----
        if (route?.MarkdownShikiHtml) {

            //  -----  recorrer las entradas de la ruta  -----
            for (const entry of route.MarkdownShikiHtml) {

                //  -----  guardar la entrada para generarla  -----
                entries.push(entry);

            }

        }

    }

    /** @type {ShikiGenResult[]} - `resultado de generar u omitir cada entrada` */
    const results = await Promise.all(
        
        entries.map(async (entry) => {

            /** - `nombre, extensión y urls de la entrada` */
            const { fileName, fileExtension, urlInput, urlOutput } = entry;

            /** @type {string | null} - `lenguaje shiki de la extensión` */
            const lang = mapLang(fileExtension ?? '');

            /** @type {string | null} - `carpeta relativa de salida` */
            const outDir = deriveOutputDir(urlOutput ?? '');

            //  -----  si falta algún dato obligatorio, omitir la entrada  -----
            if (!fileName || !lang || !urlInput || !outDir) {

                //  -----  marcar la entrada como omitida  -----
                return {
                    status: 'skipped',
                    message: `⚠️  Entrada incompleta (fileName/fileExtension/urlInput/urlOutput): ${fileName ?? '(sin fileName)'}`,
                };

            }

            /** - `ruta en disco del fuente` */
            const srcPath = urlToDisk(urlInput);

            /** - `ruta en disco del html generado` */
            const outPath = join(__dirname, 'src/markdown-shiki', outDir, fileName);

            //  -----  si el fuente no existe, omitir la entrada  -----
            if (!existsSync(srcPath)) {

                /** - `ruta del fuente relativa al proyecto` */
                const rel = srcPath.replace(__dirname + '/', '');

                //  -----  marcar la entrada como omitida  -----
                return {
                    status: 'skipped',
                    message: `⚠️  Fuente no encontrado: ${fileName}\n     urlInput no existe en disco: ${rel}`,
                };

            }

            /** - `código fuente leído` */
            const rawCode = readFileSync(srcPath, 'utf-8');

            /** - `código sin el banner inicial, si toca quitarlo` */
            const code = STRIP_HEADER_BANNER ? stripHeaderBanner(rawCode) : rawCode;

            /** - `html resaltado con shiki` */
            const html = await codeToHtml(code, { lang, theme: SHIKI_THEME });

            //  -----  crear la carpeta de salida  -----
            mkdirSync(dirname(outPath), { recursive: true });

            //  -----  guardar el html resaltado  -----
            writeFileSync(outPath, html, 'utf-8');

            /** - `salida relativa al proyecto` */
            const relOut = outPath.replace(__dirname + '/', '');

            /** - `fuente relativo al proyecto` */
            const relSrc = srcPath.replace(__dirname + '/', '');

            //  -----  marcar la entrada como generada  -----
            return {
                status: 'generated',
                message: `✅  ${relOut}  ←  ${relSrc}`,
            };

        })
    );

    //  -----  mostrar el resultado de cada entrada  -----
    for (const result of results) {

        //  -----  escribir el mensaje en consola  -----
        console.log(result.message);

    }

    /** - `cuántos bloques se generaron` */
    const generated = results.filter((r) => r.status === 'generated').length;

    /** - `cuántos bloques se omitieron` */
    const skipped = results.filter((r) => r.status === 'skipped').length;

    //  -----  resumir generados y omitidos  -----
    console.log(`\n🎉  Completado — generados: ${generated} | omitidos: ${skipped}`);

    //  -----  devolver el recuento  -----
    return { generated, skipped };

};



//  -----  si el script se ejecuta directamente, generar los bloques  -----
if (process.argv[1] === __filename) {

    //  -----  generar los html de shiki  -----
    await generateMarkdownShiki();

}
