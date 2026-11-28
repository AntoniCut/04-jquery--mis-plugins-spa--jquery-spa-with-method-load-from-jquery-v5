/*
    *  ---------------------------------------------------------------------------------  *
    *  -----  server.js  --  /packages/vanilla-spa-core/test/server.js  -----  *
    *  ---------------------------------------------------------------------------------  *
*/


import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';


/** - `raíz del paquete vanilla-spa-core` */
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** - `raíz del fixture` */
const fixtureRoot = path.join(packageRoot, 'test', 'fixture');

/** - `puerto del servidor del fixture` */
const port = Number(process.env.VANILLA_SPA_TEST_PORT || 4173);


/** - `URL base del fixture` */
const fixtureBase = '/test/fixture';


/** - `archivos del fixture que viven en disco` */
const diskFiles = new Set([
    `${fixtureBase}/index.html`,
    `${fixtureBase}/main.js`,
    `${fixtureBase}/spa.js`,
    `${fixtureBase}/routes/route-manifest.js`,
]);


/**
 * ------------------------------------------
 * -----  `contentType(filePath)`  -----
 * ------------------------------------------
 * - Devuelve el Content-Type según la extensión.
 * @param {string} filePath - Ruta del archivo.
 * @return {string} - Content-Type.
 */
const contentType = (filePath) => {

    /** @type {Record<string, string>} - `mapa mínimo de extensiones del fixture` */
    const types = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
    };

    //  -----  devolver el tipo o binario  -----
    return types[path.extname(filePath)] || 'application/octet-stream';

};


/**
 * ------------------------------------------
 * -----  `routeModule(name, source)`  -----
 * ------------------------------------------
 * - Crea la respuesta de un módulo de ruta del fixture.
 * @param {string} name - Nombre del export.
 * @param {string} source - Cuerpo del módulo.
 * @return {[string, string]} - Content-Type y contenido.
 */
const routeModule = (name, source) => [
    'text/javascript; charset=utf-8',
    `export const ${name} = ${source};\n`,
];


/** - `respuestas del fixture que no viven en disco` */
const files = new Map([

    //  -----  rutas  -----
    [`${fixtureBase}/routes/route-home.js`, routeModule('routeHome', `{
        id: 'home',
        path: '',
        pageTitle: 'Home',
        headerTitle: 'Home',
        favicon: '${fixtureBase}/assets/logo.svg',
        components: {
            '#layoutHeader': '${fixtureBase}/components/header.html',
            'layoutMain': '${fixtureBase}/pages/home.html',
            '#layoutFooter': '${fixtureBase}/components/footer.html',
        },
        pagesComponents: [
            { url: '${fixtureBase}/pages-components/hello.html', target: '[data-component-page="hello"]' },
        ],
        MarkdownShikiHtml: [
            { fileName: 'block.html', urlOutput: '${fixtureBase}/markdown', target: '[data-shiki="code"]' },
        ],
        styles: [
            { href: '${fixtureBase}/assets/page.css' },
        ],
        scripts: [
            { src: '${fixtureBase}/scripts/classic.js' },
            { src: '${fixtureBase}/scripts/module.js', type: 'module', exportFunctionName: 'mount' },
            { src: '${fixtureBase}/scripts/legacy-module.js', isModule: true, exportFunctionName: 'mount' },
        ],
        libs: [{ name: 'tooltip' }],
    }`)],

    [`${fixtureBase}/routes/route-about.js`, routeModule('routeAbout', `{
        id: 'about',
        path: 'about',
        pageTitle: 'About',
        headerTitle: 'About page',
        favicon: '${fixtureBase}/assets/logo.svg',
        components: {
            '#layoutHeader': '${fixtureBase}/components/header.html',
            '#layoutMain': '${fixtureBase}/pages/about.html',
            '#layoutFooter': '${fixtureBase}/components/footer.html',
        },
        pagesComponents: null,
        MarkdownShikiHtml: null,
        styles: null,
        scripts: null,
    }`)],

    [`${fixtureBase}/routes/route-slow.js`, routeModule('routeSlow', `{
        id: 'slow',
        path: 'slow',
        pageTitle: 'Slow',
        headerTitle: 'Slow page',
        favicon: '${fixtureBase}/assets/logo.svg',
        components: {
            '#layoutHeader': '${fixtureBase}/components/header.html',
            '#layoutMain': '${fixtureBase}/pages/slow.html',
            '#layoutFooter': '${fixtureBase}/components/footer.html',
        },
        pagesComponents: null,
        MarkdownShikiHtml: null,
        styles: null,
        scripts: null,
    }`)],

    [`${fixtureBase}/routes/route-404.js`, routeModule('route404', `{
        id: '404NotFoundPage',
        path: '404',
        pageTitle: '404',
        headerTitle: '404',
        favicon: '${fixtureBase}/assets/logo.svg',
        components: {
            '#layoutHeader': '${fixtureBase}/components/header.html',
            '#layoutMain': '${fixtureBase}/pages/404.html',
            '#layoutFooter': '${fixtureBase}/components/footer.html',
        },
        pagesComponents: null,
        MarkdownShikiHtml: null,
        styles: null,
        scripts: null,
    }`)],

    //  -----  componentes del layout  -----
    [`${fixtureBase}/components/header.html`, ['text/html; charset=utf-8', '<p id="headerContent">Header del fixture</p><span id="headerTitle"></span>']],
    [`${fixtureBase}/components/footer.html`, ['text/html; charset=utf-8', '<p id="footerContent">Footer del fixture</p><span id="footerTitle"></span>']],

    //  -----  páginas  -----
    [`${fixtureBase}/pages/home.html`, ['text/html; charset=utf-8', '<section data-component-page="hello"></section><section data-shiki="code"></section><a id="linkAbout" href="/test/fixture/about" data-id="about">About</a><a id="linkAboutFile" href="/test/fixture/about" data-route="route-about">About by file</a><a id="linkSlow" href="/test/fixture/slow" data-id="slow">Slow</a>']],
    [`${fixtureBase}/pages/about.html`, ['text/html; charset=utf-8', '<p id="aboutPage">About page</p><a id="linkHome" href="/test/fixture/" data-id="home">Home</a>']],
    [`${fixtureBase}/pages/slow.html`, ['text/html; charset=utf-8', '<p id="slowPage">Slow page</p>']],
    [`${fixtureBase}/pages/404.html`, ['text/html; charset=utf-8', '<p id="notFound">404 del fixture</p>']],

    //  -----  fragmentos y Shiki  -----
    [`${fixtureBase}/pages-components/hello.html`, ['text/html; charset=utf-8', '<p id="pageComponent">Page component OK</p><img id="relativeImage" src="../assets/logo.svg" alt="logo">']],
    [`${fixtureBase}/markdown/block.html`, ['text/html; charset=utf-8', '<pre id="shikiBlock"><code>Shiki OK</code></pre>']],

    //  -----  scripts  -----
    [`${fixtureBase}/scripts/classic.js`, ['text/javascript; charset=utf-8', `(() => {
        document.body.dataset.classicRuns = String(Number(document.body.dataset.classicRuns || '0') + 1);
        const marker = document.createElement('p');
        marker.id = 'classicMarker';
        marker.textContent = 'Classic OK ' + document.body.dataset.classicRuns;
        document.body.appendChild(marker);
    })();`]],
    [`${fixtureBase}/scripts/module.js`, ['text/javascript; charset=utf-8', `export const mount = () => {
        document.body.dataset.moduleRuns = String(Number(document.body.dataset.moduleRuns || '0') + 1);
        const marker = document.createElement('p');
        marker.id = 'moduleMarker';
        marker.textContent = 'Module OK ' + document.body.dataset.moduleRuns;
        document.body.appendChild(marker);
    };`]],
    [`${fixtureBase}/scripts/legacy-module.js`, ['text/javascript; charset=utf-8', `export const mount = () => {
        const marker = document.createElement('p');
        marker.id = 'legacyMarker';
        marker.textContent = 'Legacy module OK';
        document.body.appendChild(marker);
    };`]],

    //  -----  assets  -----
    [`${fixtureBase}/assets/page.css`, ['text/css; charset=utf-8', 'body { --page-style-loaded: 1; }']],
    [`${fixtureBase}/assets/logo.svg`, ['image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>']],

]);


/**
 * ----------------------------------------------
 * -----  `readDiskFile(filePath)`  -----
 * ----------------------------------------------
 * - Lee un archivo del disco.
 * @param {string} filePath - Ruta absoluta.
 * @return {Promise<Buffer>} - Contenido del archivo.
 */
const readDiskFile = (filePath) => readFile(filePath);


/**
 * ----------------------------------------------
 * -----  `serveFixtureIndex(res)`  -----
 * ----------------------------------------------
 * - Sirve el index del fixture.
 * @param {import('node:http').ServerResponse} res - Respuesta HTTP.
 * @return {Promise<void>}
 */
const serveFixtureIndex = async (res) => {

    /** - `HTML del index del fixture` */
    const html = await readDiskFile(path.join(fixtureRoot, 'index.html'));

    //  -----  responder el index  -----
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);

};


/** - `servidor del fixture` */
const server = http.createServer(async (req, res) => {

    /** - `URL de la petición` */
    const url = new URL(req.url || '/', 'http://localhost');

    /** - `pathname solicitado` */
    const pathname = decodeURIComponent(url.pathname);

    //  -----  redirigir la raíz al fixture  -----
    if (pathname === '/') {

        //  -----  redirigir a la base del fixture  -----
        res.writeHead(302, { location: `${fixtureBase}/` });
        res.end();
        return;

    }

    //  -----  servir el index en la base del fixture  -----
    if (pathname === fixtureBase || pathname === `${fixtureBase}/` || pathname === `${fixtureBase}/index.html`) {

        //  -----  responder el index  -----
        await serveFixtureIndex(res);
        return;

    }

    //  -----  retardo artificial para probar el aborto de navegación  -----
    if (pathname === `${fixtureBase}/pages/slow.html`) {

        //  -----  esperar 800 ms antes de servir la página  -----
        await new Promise((resolve) => setTimeout(resolve, 800));

    }

    //  -----  servir el código del paquete  -----
    if (pathname.startsWith('/src/')) {

        /** - `ruta absoluta del archivo del paquete` */
        const filePath = path.resolve(packageRoot, `.${pathname}`);

        //  -----  impedir salir de la raíz del paquete  -----
        if (!filePath.startsWith(`${packageRoot}${path.sep}`)) {

            //  -----  responder prohibido  -----
            res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
            res.end('Prohibido');
            return;

        }

        //  -----  intentar leer el archivo  -----
        try {

            //  -----  leer el archivo del paquete  -----
            const data = await readDiskFile(filePath);

            //  -----  responder el archivo  -----
            res.writeHead(200, { 'content-type': contentType(filePath) });
            res.end(data);

        }

        //  -----  si no existe, responder 404  -----
        catch (error) {

            //  -----  responder no encontrado  -----
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            res.end(`No encontrado: ${pathname}`);

        }

        return;

    }

    //  -----  servir los archivos del fixture que viven en disco  -----
    if (diskFiles.has(pathname)) {

        /** - `ruta relativa dentro del fixture` */
        const relative = pathname.slice(fixtureBase.length + 1);

        /** - `ruta absoluta del archivo del fixture` */
        const filePath = path.join(fixtureRoot, relative);

        //  -----  intentar leer el archivo  -----
        try {

            //  -----  leer el archivo del fixture  -----
            const data = await readDiskFile(filePath);

            //  -----  responder el archivo  -----
            res.writeHead(200, { 'content-type': contentType(filePath) });
            res.end(data);

        }

        //  -----  si no existe, responder 404  -----
        catch (error) {

            //  -----  responder no encontrado  -----
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            res.end(`No encontrado: ${pathname}`);

        }

        return;

    }

    //  -----  servir los archivos generados del fixture  -----
    const entry = files.get(pathname);

    //  -----  si la entrada existe, responderla  -----
    if (entry) {

        //  -----  responder el contenido  -----
        res.writeHead(200, { 'content-type': entry[0] });
        res.end(entry[1]);
        return;

    }

    //  -----  fallback SPA del fixture  -----
    if (pathname.startsWith(`${fixtureBase}/`) && !path.extname(pathname)) {

        //  -----  responder el index  -----
        await serveFixtureIndex(res);
        return;

    }

    //  -----  responder 404 al resto  -----
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`No encontrado: ${pathname}`);

});


//  -----  arrancar el servidor del fixture  -----
server.listen(port, '127.0.0.1', () => {

    //  -----  separar el aviso en consola  -----
    console.log('\n');

    //  -----  indicar la URL del fixture  -----
    console.log(`Fixture de vanilla-spa-core en http://127.0.0.1:${port}${fixtureBase}/`);

    //  -----  separar el aviso en consola  -----
    console.log('\n');

});
