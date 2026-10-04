/*
    *  ----------------------------------------------------------------  *
    *  -----  stop-dev-server.js  --  /server/stop-dev-server.js  -----  *
    *  ----------------------------------------------------------------  *
*/


//  -----  cargar las variables de entorno  -----
import 'dotenv/config';

//  -----  ejecutar comandos del sistema  -----
import { execFile } from 'node:child_process';

//  -----  convertir el callback en promesa  -----
import { promisify } from 'node:util';


/** - `ejecuta un comando y devuelve su salida` */
const execFileAsync = promisify(execFile);

/** - `puerto público de BrowserSync` */
const DEV_SERVER_PORT = Number(process.env.DEV_SERVER_PORT || 3000);

/** - `puerto de BrowserSync y el del socket siguiente` */
const DEV_SERVER_PORTS = [DEV_SERVER_PORT, DEV_SERVER_PORT + 1];



/**
 * -----------------------------------------
 * -----  `runCommand(command, args)`  -----
 * -----------------------------------------
 * - Ejecuta un comando y devuelve su salida estándar.
 * @param {string} command - Ejecutable.
 * @param {string[]} args - Argumentos del comando.
 * @return {Promise<string>} - `Salida estándar, también si el comando sale con código 1`.
 */
const runCommand = async (command, args) => {

    //  -----  intentar ejecutar el comando  -----
    try {

        /** - `salida estándar del comando` */
        const { stdout } = await execFileAsync(command, args, { encoding: 'utf8' });

        //  -----  devolver la salida  -----
        return stdout;
    }

    //  -----  si el comando falla, mirar si aun así dejó salida  -----
    catch (error) {

        //  -----  ss y ps usan el código 1 cuando no hay coincidencias  -----
        if (
            typeof error === 'object'
            && error !== null
            && 'stdout' in error
            && 'code' in error
            && typeof error.stdout === 'string'
            && error.code === 1
        ) {

            //  -----  devolver esa salida  -----
            return error.stdout;

        }

        //  -----  relanzar cualquier otro fallo  -----
        throw error;

    }

};



/**
 * ----------------------------------------------------
 * -----  `getProcessIdsListeningOnPorts(ports)`  -----
 * ----------------------------------------------------
 * - Devuelve los PID que escuchan en los puertos indicados.
 * @param {number[]} ports - Puertos a inspeccionar.
 * @return {Promise<number[]>} - `PID sin repetir`.
 */
const getProcessIdsListeningOnPorts = async (ports) => {

    /** - `salida de ss con los sockets en escucha` */
    const ssOutput = await runCommand('ss', ['-ltnp']);

    /** - `patrones de cada puerto candidato` */
    const portMatchers = ports.map((port) => new RegExp(`:${port}\\b`));

    /** @type {Set<number>} - `PID ya vistos` */
    const processIds = new Set();

    //  -----  recorrer cada línea de ss  -----
    for (const line of ssOutput.split('\n')) {

        //  -----  si la línea no es de un puerto candidato, saltarla  -----
        if (!portMatchers.some((matcher) => matcher.test(line))) 
            //  -----  pasar a la siguiente línea  -----
            continue;

        //  -----  recoger cada pid= de la línea  -----
        for (const match of line.matchAll(/pid=(\d+)/g)) {

            //  -----  guardar el PID  -----
            processIds.add(Number(match[1]));
        }
    }

    //  -----  devolver los PID  -----
    return [...processIds];

};



/**
 * --------------------------------------------
 * -----  `getProcessCommand(processId)`  -----
 * --------------------------------------------
 * - Lee el comando completo de un PID.
 * @param {number} processId - PID a consultar.
 * @return {Promise<string>} - `Línea de argumentos, sin espacios alrededor`.
 */
const getProcessCommand = async (processId) => {

    /** - `argumentos del proceso` */
    const processOutput = await runCommand('ps', ['-p', String(processId), '-o', 'args=']);

    //  -----  devolver el comando sin espacios alrededor  -----
    return processOutput.trim();

};



/**
 * ---------------------------------------------------------------------------
 * -----  `waitForProcessIdsToLeavePorts(ports, processIds, timeoutMs)`  -----
 * ---------------------------------------------------------------------------
 * - Espera a que esos PID dejen de escuchar en los puertos.
 * 
 * `@async`
 * @param {number[]} ports - Puertos a vigilar.
 * @param {number[]} processIds - PID que deben desaparecer.
 * @param {number} [timeoutMs=3000] - Milisegundos máximos de espera.
 * @return {Promise<boolean>} - `True si ya no escuchan antes del tiempo límite`.
 */
const waitForProcessIdsToLeavePorts = async (ports, processIds, timeoutMs = 3000) => {

    /** - `instante en que empezó la espera` */
    const startedAt = Date.now();

    //  -----  reintentar hasta agotar el tiempo  -----
    while (Date.now() - startedAt < timeoutMs) {

        /** - `PID que siguen escuchando` */
        const activeProcessIds = await getProcessIdsListeningOnPorts(ports);

        //  -----  si ninguno de los PID pedidos sigue, ya pararon  -----
        if (!activeProcessIds.some((processId) => processIds.includes(processId))) 
            //  -----  la parada se confirmó  -----
            return true;

        //  -----  esperar un instante antes de volver a mirar  -----
        await new Promise((resolve) => {

            //  -----  programar el siguiente intento  -----
            setTimeout(resolve, 150);

        });
    }

    //  -----  el tiempo se agotó y siguen escuchando  -----
    return false;

};



/**
 * ----------------------
 * -----  `main()`  -----
 * ----------------------
 * - Detiene la instancia local de server/dev-server.js.
 * 
 * `@async`
 * @return {Promise<void>} - `Termina cuando el proceso ya no escucha, o sale con error`.
 */
const main = async () => {

    /** - `PID que escuchan en los puertos del desarrollo` */
    const processIds = await getProcessIdsListeningOnPorts(DEV_SERVER_PORTS);

    //  -----  si no hay nadie escuchando, no hay nada que parar  -----
    if (processIds.length === 0) {

        //  -----  avisar de que el servidor no está en marcha  -----
        console.log(`No hay ninguna instancia activa de server/dev-server.js escuchando en los puertos ${DEV_SERVER_PORTS.join(' o ')}.`);

        //  -----  terminar sin error  -----
        return;
    }

    /** @type {number[]} - `PID del servidor de desarrollo` */
    const devServerProcessIds = [];

    /** @type {{ processId: number, command: string }[]} - `otros procesos en esos puertos` */
    const foreignProcesses = [];

    //  -----  separar el servidor de desarrollo del resto  -----
    for (const processId of processIds) {

        /** - `comando del PID` */
        const command = await getProcessCommand(processId);

        //  -----  si es el servidor de desarrollo, guardarlo  -----
        if (command.includes('server/dev-server.js')) {

            //  -----  marcar el PID para detenerlo  -----
            devServerProcessIds.push(processId);

            //  -----  no tratarlo como proceso ajeno  -----
            continue;
        }

        //  -----  anotar el proceso que no es el servidor  -----
        foreignProcesses.push({ processId, command });

    }

    //  -----  si el puerto lo ocupa otro programa, no matarlo  -----
    if (devServerProcessIds.length === 0) {

        //  -----  avisar de que no está el servidor de desarrollo  -----
        console.error('No se encontró ninguna instancia de server/dev-server.js para detener.');

        //  -----  si hay otros procesos, listarlos  -----
        if (foreignProcesses.length > 0) {

            //  -----  explicar quién ocupa los puertos  -----
            console.error('Los puertos inspeccionados están ocupados por otros procesos:');

            //  -----  mostrar cada proceso ajeno  -----
            for (const foreignProcess of foreignProcesses) {

                //  -----  escribir el PID y su comando  -----
                console.error(`- PID ${foreignProcess.processId}: ${foreignProcess.command}`);
            }
        }

        //  -----  salir con error  -----
        process.exit(1);

    }

    //  -----  pedir a cada instancia que termine  -----
    for (const processId of devServerProcessIds) {

        //  -----  enviar SIGTERM  -----
        process.kill(processId, 'SIGTERM');
    }

    /** - `si los PID dejaron los puertos` */
    const stoppedSuccessfully = await waitForProcessIdsToLeavePorts(DEV_SERVER_PORTS, devServerProcessIds);

    //  -----  si siguen escuchando, la parada falló  -----
    if (!stoppedSuccessfully) {

        //  -----  avisar de que SIGTERM no bastó  -----
        console.error('No se pudo detener la instancia de desarrollo tras enviar SIGTERM.');

        //  -----  salir con error  -----
        process.exit(1);
    }

    //  -----  confirmar los PID detenidos  -----
    console.log(`Instancia de desarrollo detenida. PID: ${devServerProcessIds.join(', ')}.`);

};



//*  -----  detener el servidor y salir si falla  -----
main().catch((
    /** @type {unknown} - `fallo al detener el servidor` */
    error
) => {

    //  -----  escribir el fallo  -----
    console.error(error instanceof Error ? error.message : error);

    //  -----  salir con error  -----
    process.exit(1);

});
