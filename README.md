# jQuery SPA with Method Load from jQuery — v5

Prototipo y referencia del plugin **`jquery.spa-with-method-load-from-jquery.js`**: una SPA sin frameworks que carga fragmentos HTML con **`jQuery.load()`**, enruta con un manifiesto ligero, integra **jQuery UI** bajo demanda, resalta código con **Markdown Shiki** y se construye con Gulp y servidores Express.

Este repositorio es la base de los proyectos que usen este tipo de SPA. El código que se edita vive en `src/`. `app/` y `dist/` los genera Gulp.

**Autor:** Antonio Francisco Cutillas García — [AntonyDev](https://antonydev.tech)  
**Licencia:** ISC

---

## Novedades respecto a v4

| Área | v5 |
|---|---|
| Motor de carga | Pipeline en **3 fases**: precarga HTML → mutación síncrona del DOM (View Transition) → scripts y libs |
| Configuración | `defaultSettings` se fusiona con las opciones del proyecto mediante `$.extend` |
| Contenido por vista | `pagesComponents` inyecta fragmentos HTML en contenedores anidados dentro de `#layoutMain` |
| Código resaltado | `MarkdownShikiHtml` genera e inyecta bloques Shiki en `[data-shiki="..."]` |
| Página de inicio | Shell (`home.html`) + componentes (`home-description.html`, `home-demo.html`) + bloque del plugin |
| Navbar | `actionsNavbar()`, dentro del plugin SPA, abre y cierra el menú principal y el de themes |
| jQuery | Carga por módulo ESM (`isJQueryModule = true`). El fallback CDN → local sigue disponible |
| Tooltips / themes | Carga ordenada: libs jQuery UI → themes → scripts (`tooltips.js`) |

La vista de inicio documenta el plugin: `src/pages/home.html`, `src/pages-components/home-description.html` y `src/pages-components/home-demo.html`.

---

## Características del plugin

| Área | Detalle |
|---|---|
| Carga de vistas | `$(selector).load(url)` sobre `route.components`, `route.pagesComponents` y `route.MarkdownShikiHtml` |
| Rutas | Lazy loading con `import()` + caché en `Map`; manifiesto `{ id, path, file }` |
| Navegación | `history.pushState` / `popstate`; enlaces `a[data-id]` y `a[data-route]`; `routeFile` en el state |
| Metadatos | `pageTitle`, `headerTitle`, `favicon`, CSS y JS por ruta |
| jQuery UI | `libs` + `libLoader`; draggable, navbar, cambio de themes dinámico |
| Extras | View Transitions API, Markdown Shiki, reescritura de URLs inyectadas, 404 integrada |
| Eventos | `spa:route-loaded`, `spa:first-route-loaded`, `spa:route-load-error` |

### Pipeline de carga por ruta

1. **Fase 1 — Precarga** (`preloadRouteContent`): descarga en paralelo el HTML de `components`, `pagesComponents` y `MarkdownShikiHtml` con `.load()`, fuera de la View Transition.
2. **Fase 2 — Mutación síncrona** (`applyPreloadedContent`): inyecta el HTML precargado en orden de dependencia (components → `actionsNavbar()` → pagesComponents → Markdown Shiki) dentro de `document.startViewTransition`.
3. **Fase 3 — Metadatos async** (`applyRouteMetaAsync`): carga `libs` jQuery UI, inicializa themes y draggables, y ejecuta los scripts de la ruta.

---

## Tecnologías

| Herramienta | Versión | Rol |
|---|---|---|
| jQuery | 4.x | Biblioteca principal y método `.load()` |
| jQuery UI | 1.14.x | Widgets e interacciones (carga bajo demanda) |
| Sass (Dart) | 1.x | Preprocesador CSS |
| Gulp | 5.x | Pipeline de build (`src/` → `app/` → `dist/`) |
| Express | 5.x | Servidor de desarrollo y preview |
| BrowserSync | 3.x | Live reload |
| Shiki | 4.x | Resaltado de código (Markdown Shiki) |
| markdown-it | 14.x | Parser Markdown para generación Shiki |
| sharp | 0.34.x | Optimización de imágenes |
| pnpm | 9.x | Gestor de paquetes |
| Node.js | ESM | Runtime (`"type": "module"`) |

---

## Requisitos previos

- **Node.js** ≥ 18
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **php-cgi** y la extensión **mysqli** (`php8.3-cgi`, `php8.3-mysql`) — la página MySQL llama a `app/services/mysql/query.php` también en desarrollo
- **Docker** — MySQL local del proyecto (`docker compose up -d`), publicado en el puerto **3307**

---

## Instalación

```bash
pnpm install
```

---

## Comandos

| Comando | Descripción |
|---|---|
| `pnpm dev` | Vacía `app/` y `src/markdown-shiki/`, regenera todo desde `src/` y arranca watch + servidor |
| `pnpm dev:watch` | Observa `src/` y sincroniza `app/`. No resetea ni levanta el servidor |
| `pnpm reset` | Vacía `app/` y `src/markdown-shiki/`. No vuelve a copiar ni compilar |
| `pnpm refresh` | Vacía y vuelve a copiar/compilar `src/` → `app/`, sin quedar a la escucha |
| `pnpm serve:dev` | Levanta Express + BrowserSync sobre `app/` ya generado |
| `pnpm server` | Alias de `serve:dev` |
| `pnpm stop:dev` | Cierra el servidor de desarrollo si sigue en marcha |
| `pnpm code-highlight` | Genera los bloques HTML de Shiki en `src/markdown-shiki/` |
| `pnpm convert-images` | Convierte las capturas PNG de `assets/img/clase-*` a AVIF |
| `pnpm build` | Limpia `dist/`, `app/` y markdown-shiki, regenera `app/` y minifica a `dist/` |
| `pnpm preview` | Sirve `dist/` y abre el navegador (puerto 4173 por defecto) |
| `pnpm add:ts-nocheck` | Añade `// @ts-nocheck` a los JS de desarrollo que lo necesiten |

### Variables de entorno

Ningún `.env` se versiona (`.gitignore` ignora `.env` y `.env.*`).

El servidor de desarrollo lee el puerto y el watch desde `.env`:

```dotenv
DEV_SERVER_PORT=3000        # Puerto público del servidor dev (BrowserSync)
PREVIEW_SERVER_PORT=4173    # Puerto del servidor preview
CHOKIDAR_USEPOLLING=false   # true en WSL/Docker si el watch falla
CHOKIDAR_INTERVAL=250       # Intervalo de polling en ms
```

MySQL local (Docker, puerto **3307**) también va en ese `.env`. La plantilla está en `.env.example`:

```dotenv
MYSQL_ROOT_PASSWORD=
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=jquery_user
MYSQL_PASSWORD=
MYSQL_DATABASE=jquery_mis_plugins_spa
```

Producción usa otro archivo, `.env.production`. Mismas claves `MYSQL_*`, pero el puerto es el del MySQL del VPS (**3306**), no el 3307 de Docker. `deploy.sh` copia ese archivo al VPS con el nombre `.env`.

---

## URL base

El proyecto se sirve bajo:

```
/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/
```

Desarrollo: [http://localhost:3000/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/](http://localhost:3000/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/)

Preview: [http://localhost:4173/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/](http://localhost:4173/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/)

Ese prefijo tiene que coincidir en cuatro sitios:

- `<base href>` de `index.html`
- `base` en `src/routes/paths.js`
- `DEV_ROUTE_BASE` en `server/dev-server.js`
- `DEV_ROUTE_BASE` en `server/preview-server.js`

---

## Uso del plugin

`src/main.js` elige el modo de carga. Con `isJQueryModule = true` importa jQuery como módulo ESM, registra el plugin, arranca la SPA y precarga jQuery UI en background tras `window load`. Con `false` usa el fallback CDN → local de `fallbackJQueryJQueryUI()`.

La configuración del sitio está en `src/spa/spa.js`:

```javascript
import { spaWithMethodLoadFromJQueryPlugins } from './plugins/spa-with-method-load-from-jquery/v5/jquery.spa-with-method-load-from-jquery.js';

spaWithMethodLoadFromJQueryPlugins();

$('#layout').spaWithMethodLoadFromJQuery({
    routeManifest,
    routeModulesBase: `${base}/app/routes`,
    base,
    draggable: true,
    libLoader: loadJQueryUILib,
});
```

`defaultSettings` del plugin deja `routeManifest` vacío, `draggable` en `false` y `libLoader` en `null`. `$.extend` las sustituye por las opciones del proyecto.

### Opciones de configuración

| Opción | Descripción |
|---|---|
| `routeManifest` | Array `{ id, path, file }` para lazy loading |
| `routeModulesBase` | Ruta base de los módulos de ruta (`import()`). En desarrollo apunta a `app/routes` |
| `base` | Prefijo URL de la aplicación |
| `draggable` | Habilita `.draggable()` en elementos con clase `.draggable` |
| `libLoader` | Función async `(name) => void` para cargar widgets jQuery UI |

### Propiedades de cada ruta (`Route`)

`id`, `path`, `pageTitle`, `headerTitle`, `favicon`, `components`, `pagesComponents`, `MarkdownShikiHtml`, `styles`, `scripts`, `libs`.

Los tipos JSDoc viven en `types/`. `Route` está en `types/route.d.js` y las opciones del plugin en `types/config-options-spa.d.js`.

#### `components`

Mapa `selector → URL` de fragmentos del layout (`#layoutHeader`, `#layoutNavbar`, `#layoutMain`, `#layoutFooter`, …).

#### `pagesComponents`

Array `{ url, target }` que inyecta HTML dentro del shell de la página, por ejemplo `[data-component-page="homeDescription"]`.

#### `MarkdownShikiHtml`

Array con `fileName`, `fileExtension`, `urlInput`, `urlOutput` y `target` (`[data-shiki="..."]`). Gulp genera el HTML resaltado y el plugin lo inyecta después de los `pagesComponents`.

`path` del manifiesto y `path` del módulo de ruta tienen que ser el mismo valor. Si no coinciden, `pushState` escribe una URL distinta de la que resuelve el manifiesto.

---

## Rutas incluidas

| ID | Path |
|---|---|
| `home` | `/` |
| `htmlPage` | `/stack/html-page` |
| `cssPage` | `/stack/css-page` |
| `javascriptPage` | `/stack/javascript-page` |
| `jqueryPage` | `/stack/jquery-page` |
| `jqueryUiPage` | `/stack/jquery-ui-page` |
| `reactPage` | `/stack/react-page` |
| `astroPage` | `/stack/astro-page` |
| `mysqlPage` | `/stack/mysql-page` |
| `404NotFoundPage` | `/404` |

---

## Estructura del proyecto

```
jquery-spa-with-method-load-from-jquery-v5/
│
├── index.html                        # Shell: <base>, #layout y entrada ESM
├── src/                              # Código fuente (origen de verdad)
│   ├── main.js                       # Carga jQuery, registra el plugin y arranca la SPA
│   ├── spa/spa.js                    # Opciones del plugin para este proyecto
│   ├── plugins/
│   │   ├── spa-with-method-load-from-jquery/v5/
│   │   └── actions-navbars-with-jquery-jquery-ui/
│   ├── routes/                       # paths.js, manifiesto y un módulo por ruta
│   ├── pages/                        # Shell HTML por vista
│   ├── pages-components/             # Fragmentos inyectados en cada vista
│   ├── components/                   # Header, navbar, footer y botones
│   ├── scripts/                      # JS por página (Gulp lo publica en app/js)
│   ├── scss/                         # Estilos (globals + páginas)
│   ├── effects/effect-loading-page.js
│   ├── libs/                         # jQuery clásico, themes y carga por módulo ESM
│   ├── markdown-shiki/               # HTML Shiki generado (no editar a mano)
│   └── services/                     # PHP de la consulta MySQL (load-env.php, mysql/query.php)
│
├── app/                              # Copia de desarrollo generada por Gulp
├── dist/                             # Build de producción minificado
├── assets/                           # Imágenes, fuentes y favicons
├── docker/mysql/init/                # SQL del primer arranque del contenedor local
├── docker-compose.yml                # MySQL 8.4 local, puerto 3307
├── types/                            # Tipos JSDoc del dominio
├── server/                           # dev-server, preview-server, mysql-query.js
├── gulpfile.js
└── generate-markdown-shiki.js
```

---

## Pipeline de build

1. **`pnpm dev`** — Gulp limpia, copia y compila `src/` → `app/`, regenera Shiki al cambiar SCSS y BrowserSync recarga.
2. **`pnpm code-highlight`** — Genera bloques Shiki en `src/markdown-shiki/` a partir de las entradas `MarkdownShikiHtml` de las rutas.
3. **`pnpm build`** — Limpia `dist/`, regenera `app/` y minifica HTML, CSS y JS hacia `dist/`.
4. **`pnpm preview`** — Sirve `dist/` con fallback SPA.

Los módulos de jQuery y jQuery UI que usa el navegador se copian desde `node_modules` a `app/libs/jquery-module/` durante el build. No se editan a mano.

---

## Consulta MySQL

La página `stack/mysql-page` no abre MySQL desde el navegador. El formulario hace `POST` a `app/services/mysql/query.php` con `{ "sql": "..." }` y pinta el JSON.

Ese PHP es el mismo en desarrollo y en el VPS. `server/mysql-query.js` publica `POST /api/mysql/query` solo en Express (`pnpm dev` y `pnpm preview`). La página no llama a esa ruta: en Nginx un `POST` que no es un `.php` cae en `index.html` y responde **405** con HTML.

Solo se admiten lecturas (`SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, `WITH`), una sentencia, sin `INTO OUTFILE` ni `LOAD DATA`. La respuesta muestra como máximo 200 filas.

Hay dos MySQL distintos:

| | Local | VPS |
|---|---|---|
| Proceso | Contenedor `jquery-mis-plugins-spa-mysql` (`docker compose up -d`) | El MySQL del sistema, el mismo del curso EscuelaIT |
| Puerto | **3307** | **3306** |
| Base | `jquery_mis_plugins_spa` | `jquery_mis_plugins_spa` |
| Usuario | `jquery_user` | `jquery_user` (el mismo usuario del curso; la base es otra) |
| Credenciales | `.env` | `.env.production`, subido como `.env` |

La base del curso, `jquery_escuelait_classicmodels`, no se usa aquí. En el VPS la tabla `stacks` se crea en `jquery_mis_plugins_spa` con el SQL de `docker/mysql/init/01-stacks.sql`, más el `CREATE DATABASE` y el `GRANT SELECT` para `jquery_user` en `localhost` y `127.0.0.1`.

`src/services/load-env.php` busca el `.env` subiendo carpetas desde el PHP. En el sitio publicado lo encuentra junto al `index.html`.

---

## Despliegue (Nginx)

```bash
./deploy.sh
```

`deploy.sh` está en `.gitignore` (IP y rutas del VPS) y no forma parte del repositorio. Hace dos copias:

1. `pnpm run build` y sube `dist/` a `/var/www/jquery.antonydev.tech/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/`. El `rsync --delete` excluye `.env` para no borrarlo.
2. Si existe `.env.production`, lo sube a ese directorio con el nombre `.env`, modo `640` y grupo `www-data`. Si el archivo no existe, avisa y deja el `.env` remoto como esté.

PHP-FPM corre como `www-data`. Con dueño `root:root` no puede leer el `.env`, ignora `MYSQL_PORT=3306` y prueba el **3307**. En el VPS nadie escucha ahí y MySQL responde `Connection refused`.

El bloque que sirve el sitio usa `root`. Así `$request_filename` apunta al PHP de `app/services/`. Con `alias`, esa variable deja de coincidir con el archivo.

```nginx
location = /mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5 {
    return 301 /mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/;
}

location ^~ /mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/ {
    root /var/www/jquery.antonydev.tech;
    try_files $uri $uri/ /mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/index.html;

    location ~ /\.env {
        deny all;
        return 404;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        fastcgi_param QUERY_STRING    $query_string;
    }
}
```

El `location` de `\.env` todavía no está en el Nginx del VPS. Hay que añadirlo: el archivo está junto al `index.html` y, sin ese `deny`, se puede pedir por HTTP. PHP lo sigue leyendo del disco.

---

## Eventos personalizados

| Evento | Cuándo se emite |
|---|---|
| `spa:route-loaded` | Tras renderizar una ruta (`detail.id`, `detail.path`) |
| `spa:first-route-loaded` | Primera ruta cargada con éxito (desbloquea el loader) |
| `spa:route-load-error` | Error en carga de ruta (`detail.source`, `detail.message`) |

El loader inicial (`effect-loading-page.js`) escucha los dos últimos y aplica un timeout de 6 s como fallback.

Las convenciones para quien edite el código están en [AGENTS.md](./AGENTS.md).
