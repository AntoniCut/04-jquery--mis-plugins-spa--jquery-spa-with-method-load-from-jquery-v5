/*
    *  -----------------------------------------------  *
    *  -----  server.js  --  /api/src/server.js  -----  *
    *  -----------------------------------------------  *
*/


//  -----  cargar el .env antes de leer host y puerto  -----
import './load-env.js';

/** - `router del crud de tareas en memoria` */
import { createTasksRouter } from './tasks-router.js';

import express from 'express';


/** - `host de escucha: API_HOST del .env` */
const API_HOST = process.env.API_HOST || '127.0.0.1';

/** - `puerto de escucha: API_PORT del .env` */
const API_PORT = Number(process.env.API_PORT || 3200);


/**
 * -----------------------------------------
 * -----  `methodNotAllowed(allowed)`  -----
 * -----------------------------------------
 * - Responde 405 con el método admitido en la cabecera Allow.
 * @param {string} allowed - Método HTTP que admite la ruta.
 * @return {import('express').RequestHandler} - Manejador que responde el rechazo.
 */
const methodNotAllowed = (allowed) => (req, res) => {

    //  -----  anunciar el método admitido  -----
    res.set('Allow', allowed);

    //  -----  responder el rechazo en json  -----
    res.status(405).json({
        ok: false,
        message: `Solo se admite ${allowed}.`,
    });

};



/**
 * --------------------------------------
 * -----  `handleHealth(req, res)`  -----
 * --------------------------------------
 * - Confirma que el proceso Node responde, sin tocar MySQL.
 * @param {import('express').Request} req - Petición recibida.
 * @param {import('express').Response} res - Respuesta JSON.
 * @return {void}
 */
const handleHealth = (req, res) => {

    //  -----  responder estado, uptime y fecha actual  -----
    res.json({
        ok: true,
        service: 'jquery-node-api',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });

};



/**
 * ---------------------------------------------------------
 * -----  `handleRequestError(error, req, res, next)`  -----
 * ---------------------------------------------------------
 * - Responde en JSON los errores de parseo del cuerpo.
 * @param {unknown} error - Error lanzado por express o body-parser.
 * @param {import('express').Request} req - Petición recibida.
 * @param {import('express').Response} res - Respuesta JSON.
 * @param {import('express').NextFunction} next - Siguiente middleware.
 * @return {void}
 */
const handleRequestError = (error, req, res, next) => {

    /** - `código http del error, 500 si no viene` */
    const status = typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : 500;

    /** - `mensaje estable para el cliente` */
    const message = status === 413
        ? 'El cuerpo supera los 4 KB.'
        : status === 400
            ? 'La petición no es un JSON válido.'
            : 'Error interno del API.';

    //  -----  responder el error en json  -----
    res.status(status).json({
        ok: false,
        message,
    });

};



/** - `aplicación express del runtime node de producción` */
const app = express();

//  -----  desactivar el encabezado x-powered-by  -----
app.disable('x-powered-by');

//  -----  confirmar que el proceso responde  -----
app.get('/health', handleHealth);

//  -----  rechazar métodos distintos de get en health  -----
app.all('/health', methodNotAllowed('GET'));

//  -----  montar el crud de tareas en memoria  -----
app.use(createTasksRouter());

//  -----  responder en json los errores de parseo  -----
app.use(handleRequestError);


//  -----  arrancar el servidor en API_HOST:API_PORT  -----
const server = app.listen(API_PORT, API_HOST, () => {

    //  -----  avisar la dirección efectiva  -----
    console.log(`API Node escuchando en http://${API_HOST}:${API_PORT}`);

});

//  -----  informar un puerto ocupado o un host inválido  -----
server.on('error', (error) => {

    //  -----  mostrar el mensaje del error  -----
    console.error(error instanceof Error ? error.message : error);

    //  -----  terminar con código de error  -----
    process.exit(1);

});
