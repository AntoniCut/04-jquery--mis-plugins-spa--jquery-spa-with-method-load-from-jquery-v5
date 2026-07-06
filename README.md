# jQuery SPA with Method Load from jQuery — v5

Demo y referencia del plugin **`jquery.spa-with-method-load-from-jquery.js`**: una SPA sin frameworks que carga fragmentos HTML con **`jQuery.load()`**, enruta con un manifiesto ligero, integra **jQuery UI** bajo demanda, soporta **Markdown Shiki** para resaltar código fuente y expone un pipeline de desarrollo con Gulp y servidores Express.

**Autor:** Antonio Francisco Cutillas García — [AntonyDev](https://antonydev.tech)  
**Licencia:** ISC

---

## Novedades respecto a v4

| Área | v5 |
|---|---|
| Motor de carga | Pipeline en **3 fases**: precarga HTML → mutación síncrona del DOM (View Transition) → scripts y libs |
| Contenido por vista | `pagesComponents` inyecta fragmentos HTML en contenedores anidados dentro de `#layoutMain` |
| Código resaltado | `MarkdownShikiHtml` genera e inyecta bloques Shiki en `[data-shiki="..."]` |
| Página de inicio | Shell (`home.html`) + componentes (`home-description.html`, `home-demo.html`) + bloque del plugin |
| Tooltips / themes | Carga ordenada: libs jQuery UI → themes → scripts (`tooltips.js`) sin conflictos de widgets |

Documentación ampliada en la vista de inicio: `src/pages/home.html`, `src/pages-components/home-description.html` y `src/pages-components/home-demo.html`.

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

### Pipeline de carga por ruta (v5)

1. **Fase 1 — Precarga** (`preloadRouteContent`): descarga en paralelo el HTML de `components`, `pagesComponents` y `MarkdownShikiHtml` con `.load()`, fuera de la View Transition.
2. **Fase 2 — Mutación síncrona** (`applyPreloadedContent`): inyecta el HTML precargado en orden de dependencia (components → pagesComponents → Markdown Shiki) dentro de `document.startViewTransition`.
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
| Node.js | ESM | Runtime |

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
| `pnpm dev` | Gulp watch + servidor de desarrollo con live reload |
| `pnpm dev:watch` | Solo Gulp watch (`src/` → `app/`) |
| `pnpm serve:dev` | Solo servidor Express + BrowserSync |
| `pnpm stop:dev` | Detiene el servidor de desarrollo |
| `pnpm build` | Build de producción en `dist/` |
| `pnpm preview` | Sirve `dist/` (puerto 4173 por defecto) |
| `pnpm code-highlight` | Regenera bloques HTML con Shiki |

### Variables de entorno (`.env`)

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

La constante `base` en `src/routes/paths.js` y el `<base href>` de `index.html` deben coincidir con el prefijo de despliegue.

---

## Uso del plugin

El plugin se registra en jQuery y se inicializa sobre el contenedor raíz de la SPA:

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

En este proyecto, `src/spa/spa.js` concentra esa configuración; `src/main.js` carga jQuery, registra el plugin, arranca la SPA y precarga jQuery UI en background tras `window load`.

### Opciones de configuración

| Opción | Descripción |
|---|---|
| `routeManifest` | Array `{ id, path, file }` para lazy loading |
| `routeModulesBase` | Ruta base de los módulos de ruta (`import()`) |
| `base` | Prefijo URL de la aplicación |
| `draggable` | Habilita `.draggable()` en elementos con clase `.draggable` |
| `libLoader` | Función async `(name) => void` para cargar widgets jQuery UI |

### Propiedades de cada ruta (`Route`)

`id`, `path`, `pageTitle`, `headerTitle`, `favicon`, `components`, `pagesComponents`, `MarkdownShikiHtml`, `styles`, `scripts`, `libs`.

#### `pagesComponents`

Array de entradas `{ url, target }` que inyectan HTML en contenedores dentro del shell de la página (p. ej. `[data-component-page="homeDescription"]`).

#### `MarkdownShikiHtml`

Array de entradas con `fileName`, `fileExtension`, `urlInput`, `urlOutput` y `target` (`[data-shiki="..."]`). Gulp genera el HTML resaltado en `app/markdown-shiki/`; el plugin lo inyecta tras los `pagesComponents`.

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
├── src/                              # Código fuente (origen de verdad)
│   ├── main.js                       # Entrada: jQuery, plugin y SPA
│   ├── spa/spa.js                    # Configuración del plugin por proyecto
│   ├── plugins/spa-with-method-load-from-jquery/v5/
│   │   └── jquery.spa-with-method-load-from-jquery.js
│   ├── routes/                       # Manifiesto, paths y módulos de ruta
│   ├── pages/                        # Shell HTML por vista
│   ├── pages-components/             # Fragmentos inyectados en cada vista
│   ├── components/                   # Layout (header, navbar, footer…)
│   ├── scripts/                      # JS por página
│   ├── scss/                         # Estilos SCSS
│   ├── effects/effect-loading-page.js
│   ├── libs/                         # jQuery, jQuery UI, loaders ESM
│   ├── markdown-shiki/               # HTML generado con Shiki (copiado a app/)
│   └── services/                     # PHP de ejemplo (opcional)
│
├── app/                              # Artefacto de desarrollo (Gulp)
├── dist/                             # Build de producción minificado
├── assets/                           # Imágenes, fuentes, favicons
├── types/                            # Tipos JSDoc
├── server/                           # dev-server, preview-server
├── gulpfile.js
└── generate-markdown-shiki.js
```

---

## Pipeline de build

1. **`pnpm dev`** — Gulp copia y compila `src/` → `app/`, regenera Shiki al cambiar SCSS y BrowserSync recarga al detectar cambios.
2. **`pnpm code-highlight`** — Genera bloques Shiki en `src/markdown-shiki/` y los copia a `app/markdown-shiki/` según las rutas declaradas.
3. **`pnpm build`** — Limpia `dist/`, regenera `app/` y minifica HTML, CSS y JS hacia `dist/`.
4. **`pnpm preview`** — Sirve `dist/` con fallback SPA para validar el build.

---

## Despliegue (Nginx)

```bash
pnpm run build
# Copiar dist/ al directorio público del servidor
```

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
| `spa:route-loaded` | Tras renderizar una ruta (incluye `detail.id` y `detail.path`) |
| `spa:first-route-loaded` | Primera ruta cargada con éxito (desbloquea el loader) |
| `spa:route-load-error` | Error en carga de ruta (`detail.source`, `detail.message`) |

El loader inicial (`effect-loading-page.js`) escucha los dos últimos y aplica un timeout de 6 s como fallback.
