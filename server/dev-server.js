/*
    *  ------------------------------------------------------  *
    *  -----  dev-server.js  --  /server/dev-server.js  -----  *
    *  ------------------------------------------------------  *
*/


//  -----  cargar las variables de entorno  -----
import 'dotenv/config';

//  -----  recarga del navegador  -----
import browserSync from 'browser-sync';

//  -----  servidor http  -----
import express from 'express';

//  -----  lanzar php-cgi  -----
import { spawn } from 'node:child_process';

//  -----  comprobar archivos en disco  -----
import fs from 'node:fs';

//  -----  probar si un puerto está libre  -----
import net from 'node:net';

//  -----  unir rutas  -----
import path from 'node:path';


/** - `prefijo URL del base href` */
const DEV_ROUTE_BASE = '/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5';

/** - `puerto público de BrowserSync` */
const DEV_SERVER_PORT = Number(process.env.DEV_SERVER_PORT || 3000);

/** - `raíz del proyecto` */
const PROJECT_ROOT = process.cwd();

/** - `entrada principal de la SPA` */
const SPA_ENTRY_FILE = path.join(PROJECT_ROOT, 'index.html');

/** 
 * -------------------------------------
 * -----  `BROWSER_SYNC_FILES []`  -----
 * -------------------------------------
 * - `archivos que disparan el live reload` 
 */
const BROWSER_SYNC_FILES = [
    'index.html',
    'app/**/*',
    'assets/**/*',
    '!app/**/*.map',
];


/**
 * --------------------------------
 * -----  `WATCH_OPTIONS {}`  -----
 * --------------------------------
 * - `Opciones de sondeo para el watch de BrowserSync`
 */
const WATCH_OPTIONS = {

    /** - `usar polling si CHOKIDAR_USEPOLLING es true` */
    usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',

    /** - `intervalo de polling en milisegundos` */
    interval: Number(process.env.CHOKIDAR_INTERVAL || 250),

};


/** - `aplicación Express` */
const app = express();

/** - `instancia de BrowserSync` */
const bs = browserSync.create();

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

    //  -----  si piden la raíz o index.html, ir a la base de la SPA  -----
    if (req.path === '/' || req.path === '/index.html') {

        //  -----  redirigir a la base con barra final  -----
        res.redirect(302, `${DEV_ROUTE_BASE}/`);

        //  -----  no seguir con la cadena  -----
        return;
    }

    //  -----  si piden la base sin barra, añadirla  -----
    if (req.path === DEV_ROUTE_BASE) {

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
 * - Sirve index.html cuando la ruta interna de la SPA no es un archivo.
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

    //  -----  si piden la base, servir el index  -----
    if (relativePath === '') {

        //  -----  enviar index.html  -----
        res.sendFile(SPA_ENTRY_FILE);

        //  -----  no seguir  -----
        return;

    }

    /** - `archivo pedido, resuelto en el proyecto` */
    const requestedPath = path.join(PROJECT_ROOT, relativePath);

    /** - `si la ruta trae extensión de archivo` */
    const hasFileExtension = path.extname(relativePath) !== '';

    /** - `si ese archivo existe en disco` */
    const fileExists = fs.existsSync(requestedPath);

    //  -----  si no es un archivo y no existe, servir el index  -----
    if (!hasFileExtension && !fileExists) {

        //  -----  enviar index.html  -----
        res.sendFile(SPA_ENTRY_FILE);

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
 * - Ejecuta los .php con php-cgi y devuelve la respuesta CGI.
 * @param {string} rootDir - Directorio donde se resuelven los PHP.
 * @param {number} serverPort - Puerto que php-cgi ve como SERVER_PORT.
 * @return {import('express').RequestHandler} - Middleware de PHP.
 */
const makePhpHandler = (rootDir, serverPort) => {

    /**
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
         * - `Variables CGI que recibe php-cgi`
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

            /** - `posición del separador de cabeceras` */
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
                if (colonIndex === -1) {

                    //  -----  pasar a la siguiente línea  -----
                    continue;
                }

                /** - `nombre de la cabecera` */
                const name = line.slice(0, colonIndex).trim();

                /** - `valor de la cabecera` */
                const value = line.slice(colonIndex + 1).trim();

                //  -----  si php manda Status, usarlo como código HTTP  -----
                if (name.toLowerCase() === 'status') {

                    //  -----  fijar el código de estado  -----
                    res.status(parseInt(value, 10));
                }

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



/**
 * -----------------------------------------
 * -----  `assertPortAvailable(port)`  -----
 * -----------------------------------------
 * - Comprueba que el puerto público de BrowserSync está libre.
 * @param {number} port - Puerto a probar.
 * @return {Promise<void>} - `Termina cuando el puerto se pudo abrir y cerrar`.
 */
const assertPortAvailable = (port) => {

    //  -----  probar el puerto con un servidor temporal  -----
    return new Promise((resolve, reject) => {

        /** - `servidor que solo comprueba el puerto` */
        const probeServer = net.createServer();

        //  -----  no mantener el proceso vivo por esta prueba  -----
        probeServer.unref();

        //  -----  rechazar si el puerto no se puede abrir  -----
        probeServer.once('error', (
            /** @type {NodeJS.ErrnoException} - `fallo al abrir el puerto` */
            error
        ) => {

            //  -----  si el puerto está ocupado, explicarlo  -----
            if (error.code === 'EADDRINUSE') {

                //  -----  rechazar con un mensaje claro  -----
                reject(new Error(`El puerto público ${port} ya está en uso. Cierra la instancia anterior del servidor de desarrollo o cambia DEV_SERVER_PORT.`));

                //  -----  no rechazar otra vez  -----
                return;
            }

            //  -----  rechazar cualquier otro fallo  -----
            reject(error);

        });


        //  -----  cerrar la prueba cuando el puerto responde  -----
        probeServer.once('listening', () => {

            //  -----  soltar el puerto  -----
            probeServer.close((error) => {

                //  -----  si el cierre falla, rechazar  -----
                if (error) {

                    //  -----  propagar el fallo  -----
                    reject(error);

                    //  -----  no resolver  -----
                    return;
                }

                //  -----  el puerto está libre  -----
                resolve();

            });

        });

        //  -----  intentar escuchar en el puerto  -----
        probeServer.listen(port);

    });

};



//  -----  redirigir la raíz a la base de la SPA  -----
app.use(redirectRootToBase);

//  -----  ejecutar los php con php-cgi  -----
app.use(makePhpHandler(PROJECT_ROOT, DEV_SERVER_PORT));

//  -----  servir estáticos bajo la base, sin index automático  -----
app.use(DEV_ROUTE_BASE, express.static(PROJECT_ROOT, { index: false }));

//  -----  caer en index.html en las rutas internas  -----
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


//  -----  comprobar que el puerto público está libre  -----
try {

    //  -----  reservar el puerto un instante y soltarlo  -----
    await assertPortAvailable(DEV_SERVER_PORT);
}

//  -----  si el puerto no está libre, salir  -----
catch (error) {

    //  -----  escribir el motivo  -----
    console.error(error instanceof Error ? error.message : error);

    //  -----  salir con error  -----
    process.exit(1);
}



/** 
 * ------------------------------
 * -----  `internalServer`  -----
 * ------------------------------
 * - `servidor Express interno, en un puerto libre`
 */
const internalServer = app.listen(0, '127.0.0.1', () => {

    /** - `dirección real del servidor interno` */
    const address = internalServer.address();

    //  -----  si la dirección no es un puerto, abortar  -----
    if (!address || typeof address === 'string')
        //  -----  no se puede montar el proxy  -----
        throw new Error('No se pudo resolver el puerto interno del servidor Express.');

    //  -----  separar el aviso en consola  -----
    console.log('\n');

    //  -----  mostrar la dirección interna  -----
    console.log(`Servidor de desarrollo Express escuchando en http://${address.address}:${address.port}\n`);

    //  -----  separar el aviso en consola  -----
    console.log('\n');

    //  -----  publicar el proxy y el live reload  -----
    bs.init({

        proxy: `http://127.0.0.1:${address.port}`,
        port: DEV_SERVER_PORT,
        open: false,
        notify: false,
        ui: false,
        startPath: `${DEV_ROUTE_BASE}/`,
        files: BROWSER_SYNC_FILES,
        watchOptions: WATCH_OPTIONS,

    });

});



/**
 * --------------------------
 * -----  `shutdown()`  -----
 * --------------------------
 * - Cierra BrowserSync y el servidor Express.
 */
const shutdown = () => {

    //  -----  cerrar BrowserSync  -----
    bs.exit();

    //  -----  cerrar Express y terminar el proceso  -----
    internalServer.close(() => {

        //  -----  salir cuando el servidor ya cerró  -----
        process.exit(0);

    });

};


//  -----  cerrar al recibir SIGINT  -----
process.on('SIGINT', shutdown);

//  -----  cerrar al recibir SIGTERM  -----
process.on('SIGTERM', shutdown);
