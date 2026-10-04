/*
    *  --------------------------------------------------------------  *
    *  -----  preview-server.js  --  /server/preview-server.js  -----  *
    *  --------------------------------------------------------------  *
*/


//  -----  cargar las variables de entorno  -----
import 'dotenv/config';

//  -----  servidor http  -----
import express from 'express';

//  -----  lanzar php-cgi  -----
import { spawn } from 'node:child_process';

//  -----  comprobar el build en disco  -----
import fs from 'node:fs';

//  -----  unir rutas  -----
import path from 'node:path';


/** - `prefijo URL del base href` */
const DEV_ROUTE_BASE = '/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5';

/** - `puerto público del preview` */
const PREVIEW_SERVER_PORT = Number(process.env.PREVIEW_SERVER_PORT || 4173);

/** - `raíz del build de producción` */
const DIST_ROOT = path.join(process.cwd(), 'dist');

/** - `index compilado de la SPA` */
const DIST_INDEX_FILE = path.join(DIST_ROOT, 'index.html');


//  -----  si no hay build, no arrancar  -----
if (!fs.existsSync(DIST_ROOT) || !fs.existsSync(DIST_INDEX_FILE)) {

    //  -----  pedir el build antes del preview  -----
    console.error('No existe un build de producción en dist/. Ejecuta `pnpm run build` antes de `pnpm run preview`.');

    //  -----  salir con error  -----
    process.exit(1);

}


/** - `aplicación Express` */
const app = express();


//  -----  ocultar la cabecera X-Powered-By  -----
app.disable('x-powered-by');



/**
 * --------------------------------------------------
 * -----  `redirectRootToBase(req, res, next)`  -----
 * --------------------------------------------------
 * - Redirige la raíz del servidor a la base pública de la SPA.
 * @param {import('express').Request} req - Petición entrante.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Siguiente middleware.
 */
const redirectRootToBase = (req, res, next) => {

    //  -----  si piden la raíz, index.html o la base sin barra, ir a la base  -----
    if (req.path === '/' || req.path === '/index.html' || req.path === DEV_ROUTE_BASE) {

        //  -----  redirigir a la base con barra final  -----
        res.redirect(302, `${DEV_ROUTE_BASE}/`);

        //  -----  no seguir con la cadena  -----
        return;
    }

    //  -----  dejar pasar el resto de rutas  -----
    next();

};



/**
 * ------------------------------------------------
 * -----  `serveSpaFallback(req, res, next)`  -----
 * ------------------------------------------------
 * - Sirve el index compilado cuando la ruta interna no es un archivo.
 * @param {import('express').Request} req - Petición entrante.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Siguiente middleware.
 */
const serveSpaFallback = (req, res, next) => {

    //  -----  si la ruta no es de la SPA, seguir  -----
    if (!req.path.startsWith(DEV_ROUTE_BASE)) {

        //  -----  pasar al siguiente middleware  -----
        next();

        //  -----  no servir el index  -----
        return;
    }

    /** - `ruta dentro de la SPA, sin la base` */
    const relativePath = req.path.slice(DEV_ROUTE_BASE.length).replace(/^\//, '');

    //  -----  si piden la base, servir el index compilado  -----
    if (relativePath === '') {

        //  -----  enviar el index de dist  -----
        res.sendFile(DIST_INDEX_FILE);

        //  -----  no seguir  -----
        return;
    }

    /** - `archivo pedido, resuelto dentro de dist` */
    const requestedPath = path.join(DIST_ROOT, relativePath);

    /** - `si la ruta trae extensión de archivo` */
    const hasFileExtension = path.extname(relativePath) !== '';

    /** - `si ese archivo existe en dist` */
    const fileExists = fs.existsSync(requestedPath);

    //  -----  si no es un archivo y no existe, servir el index  -----
    if (!hasFileExtension && !fileExists) {

        //  -----  enviar el index de dist  -----
        res.sendFile(DIST_INDEX_FILE);

        //  -----  no seguir  -----
        return;
    }

    //  -----  dejar que el estático o el 404 resuelvan el resto  -----
    next();

};



/**
 * ---------------------------------------------------
 * -----  `makePhpHandler(rootDir, serverPort)`  -----
 * ---------------------------------------------------
 * - Ejecuta los .php del build con php-cgi y devuelve la respuesta CGI.
 * @param {string} rootDir - Directorio donde se resuelven los PHP.
 * @param {number} serverPort - Puerto que php-cgi ve como SERVER_PORT.
 * @return {import('express').RequestHandler} - Middleware de PHP.
 */
const makePhpHandler = (rootDir, serverPort) => {

    /**
     * -----------------------------------------
     * -----  `handlePhp(req, res, next)`  -----
     * -----------------------------------------
     * @param {import('express').Request} req - Petición entrante.
     * @param {import('express').Response} res - Respuesta HTTP.
     * @param {import('express').NextFunction} next - Siguiente middleware.
     */
    const handlePhp = (req, res, next) => {

        //  -----  si no es un php, seguir  -----
        if (!req.path.endsWith('.php')) {

            //  -----  pasar al siguiente middleware  -----
            next();

            //  -----  no ejecutar php  -----
            return;
        }

        /** - `ruta del php dentro de la base, o desde la raíz` */
        const relativePath = req.path.startsWith(DEV_ROUTE_BASE)
            ? req.path.slice(DEV_ROUTE_BASE.length).replace(/^\//, '')
            : req.path.replace(/^\//, '');

        /** - `archivo php en disco` */
        const phpFile = path.join(rootDir, relativePath);

        //  -----  si el php no existe, seguir  -----
        if (!fs.existsSync(phpFile)) {

            //  -----  pasar al siguiente middleware  -----
            next();

            //  -----  no ejecutar php  -----
            return;
        }

        /** - `query string de la url original` */
        const queryString = req.originalUrl.includes('?')
            ? req.originalUrl.split('?')[1]
            : '';

        /**
         * -------------------------
         * -----  `cgiEnv {}`  -----
         * -------------------------
         * - Variables CGI que recibe php-cgi.
         */
        const cgiEnv = {

            /** - `entorno del proceso` */
            ...process.env,

            /** - `estado interno que exige php-cgi` */
            REDIRECT_STATUS: '200',

            /** - `ruta absoluta del script` */
            SCRIPT_FILENAME: phpFile,

            /** - `ruta pública del script` */
            SCRIPT_NAME: req.path,

            /** - `método HTTP` */
            REQUEST_METHOD: req.method,

            /** - `parámetros de la query` */
            QUERY_STRING: queryString,

            /** - `tipo del cuerpo` */
            CONTENT_TYPE: req.headers['content-type'] ?? '',

            /** - `longitud del cuerpo` */
            CONTENT_LENGTH: req.headers['content-length'] ?? '0',

            /** - `nombre del servidor` */
            SERVER_NAME: 'localhost',

            /** - `puerto público` */
            SERVER_PORT: String(serverPort),

            /** - `protocolo HTTP` */
            SERVER_PROTOCOL: 'HTTP/1.1',

            /** - `interfaz CGI` */
            GATEWAY_INTERFACE: 'CGI/1.1',

            /** - `cabecera Host` */
            HTTP_HOST: req.headers['host'] ?? 'localhost',

            /** - `raíz de documentos` */
            DOCUMENT_ROOT: rootDir,

        };

        /** - `proceso php-cgi` */
        const php = spawn('php-cgi', [], { env: cgiEnv });

        /** - `salida estándar acumulada` */
        let stdout = Buffer.alloc(0);

        /** - `salida de error acumulada` */
        let stderr = '';

        //  -----  acumular la salida estándar de php  -----
        php.stdout.on('data', (
            /** @type {Buffer} - `trozo de la salida de php` */
            chunk
        ) => {

            //  -----  añadir el trozo al buffer  -----
            stdout = Buffer.concat([stdout, chunk]);

        });

        //  -----  acumular la salida de error de php  -----
        php.stderr.on('data', (
            /** @type {Buffer} - `trozo del error de php` */
            chunk
        ) => {

            //  -----  añadir el texto de error  -----
            stderr += chunk.toString();

        });

        //  -----  responder cuando php termina  -----
        php.on('close', () => {

            //  -----  si php escribió en stderr, mostrarlo  -----
            if (stderr) 
                //  -----  escribir el error de php  -----
                console.error(`[php-cgi] ${stderr.trim()}`);

            /** @type {number} - `posición del separador de cabeceras` */
            let sepIndex = stdout.indexOf('\r\n\r\n');

            /** - `longitud del separador CRLF` */
            let sepLen = 4;

            //  -----  si no hay CRLF, buscar dos saltos de línea  -----
            if (sepIndex === -1) {

                //  -----  usar el separador LF  -----
                sepIndex = stdout.indexOf('\n\n');

                //  -----  el separador LF ocupa dos caracteres  -----
                sepLen = 2;
            }

            //  -----  si no hay separador, la respuesta CGI no es válida  -----
            if (sepIndex === -1) {

                //  -----  responder 500  -----
                res.status(500).send('Error: PHP no devolvió una respuesta CGI válida.');

                //  -----  no enviar un cuerpo a medias  -----
                return;
            }

            /** - `cabeceras CGI en texto` */
            const headersRaw = stdout.subarray(0, sepIndex).toString();

            /** - `cuerpo de la respuesta` */
            const body = stdout.subarray(sepIndex + sepLen);

            //  -----  copiar cada cabecera que devolvió php  -----
            for (const line of headersRaw.split(/\r?\n/)) {

                /** - `posición de los dos puntos` */
                const colonIndex = line.indexOf(':');

                //  -----  si la línea no es una cabecera, saltarla  -----
                if (colonIndex === -1)
                    //  -----  pasar a la siguiente línea  -----
                    continue;

                /** - `nombre de la cabecera` */
                const name = line.slice(0, colonIndex).trim();

                /** - `valor de la cabecera` */
                const value = line.slice(colonIndex + 1).trim();

                //  -----  si php manda Status, usarlo como código HTTP  -----
                if (name.toLowerCase() === 'status')
                    //  -----  fijar el código de estado  -----
                    res.status(parseInt(value, 10));

                //  -----  el resto de cabeceras se copian tal cual  -----
                else
                    //  -----  copiar la cabecera  -----
                    res.setHeader(name, value);
                
            }

            //  -----  enviar el cuerpo  -----
            res.send(body);

        });

        //  -----  si php-cgi no arranca, responder 500  -----
        php.on('error', () => {

            //  -----  avisar de que falta php-cgi  -----
            res.status(500).send('Error interno: php-cgi no está disponible. Instálalo con: sudo apt install php-cgi');

        });

        //  -----  pasar el cuerpo de la petición a php  -----
        req.pipe(php.stdin);

    };

    //  -----  devolver el middleware  -----
    return handlePhp;

};



//  -----  redirigir la raíz a la base de la SPA  -----
app.use(redirectRootToBase);

//  -----  ejecutar los php del build con php-cgi  -----
app.use(makePhpHandler(DIST_ROOT, PREVIEW_SERVER_PORT));

//  -----  servir dist bajo la base, sin index automático  -----
app.use(DEV_ROUTE_BASE, express.static(DIST_ROOT, { index: false }));

//  -----  caer en el index compilado en las rutas internas  -----
app.use(serveSpaFallback);

//  -----  responder 404 al resto de rutas  -----
app.use((
    /** @type {import('express').Request} - `petición no resuelta` */
    req,
    /** @type {import('express').Response} - `respuesta 404` */
    res
) => {

    //  -----  informar del método y la url  -----
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);

});



/**
 * -----------------------------
 * -----  `previewServer`  -----
 * -----------------------------
 * - `servidor de preview del build`
 */
const previewServer = app.listen(PREVIEW_SERVER_PORT, '127.0.0.1', () => {

    //  -----  separar el aviso en consola  -----
    console.log('\n');

    //  -----  mostrar la url del preview  -----
    console.log(`Preview disponible en http://localhost:${PREVIEW_SERVER_PORT}${DEV_ROUTE_BASE}/`);

    //  -----  separar el aviso en consola  -----
    console.log('\n');

});



/**
 * --------------------------
 * -----  `shutdown()`  -----
 * --------------------------
 * - Cierra el servidor de preview.
 */
const shutdown = () => {

    //  -----  cerrar Express y terminar el proceso  -----
    previewServer.close(() => {

        //  -----  salir cuando el servidor ya cerró  -----
        process.exit(0);

    });

};


//  -----  cerrar al recibir SIGINT  -----
process.on('SIGINT', shutdown);

//  -----  cerrar al recibir SIGTERM  -----
process.on('SIGTERM', shutdown);
