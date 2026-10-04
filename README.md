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
- **php-cgi** *(opcional)* — solo si usas los servicios PHP de ejemplo en `src/services/`

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

### Variables de entorno (`.env`)

El archivo `.env` no se versiona.

```dotenv
DEV_SERVER_PORT=3000        # Puerto público del servidor dev (BrowserSync)
PREVIEW_SERVER_PORT=4173    # Puerto del servidor preview
CHOKIDAR_USEPOLLING=false   # true en WSL/Docker si el watch falla
CHOKIDAR_INTERVAL=250       # Intervalo de polling en ms
```

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
│   └── services/                     # PHP de ejemplo (opcional)
│
├── app/                              # Copia de desarrollo generada por Gulp
├── dist/                             # Build de producción minificado
├── assets/                           # Imágenes, fuentes y favicons
├── types/                            # Tipos JSDoc del dominio
├── server/                           # dev-server, preview-server, stop-dev-server
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

## Despliegue (Nginx)

```bash
pnpm run build
# Copiar dist/ al directorio público del servidor
```

El script local `deploy.sh` está en `.gitignore` (IP y rutas del VPS) y no forma parte del repositorio.

Ejemplo de bloque Nginx con fallback SPA:

```nginx
location ^~ /mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/ {
    alias /var/www/jquery.antonydev.tech/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/;
    try_files $uri $uri/ /mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5/index.html;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        fastcgi_param QUERY_STRING    $query_string;
    }
}
```

---

## Eventos personalizados

| Evento | Cuándo se emite |
|---|---|
| `spa:route-loaded` | Tras renderizar una ruta (`detail.id`, `detail.path`) |
| `spa:first-route-loaded` | Primera ruta cargada con éxito (desbloquea el loader) |
| `spa:route-load-error` | Error en carga de ruta (`detail.source`, `detail.message`) |

El loader inicial (`effect-loading-page.js`) escucha los dos últimos y aplica un timeout de 6 s como fallback.

Las convenciones para quien edite el código están en [AGENTS.md](./AGENTS.md).
