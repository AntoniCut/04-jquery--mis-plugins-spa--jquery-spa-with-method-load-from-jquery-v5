# AGENTS.md

Guía para agentes que editen este repositorio. El README describe el producto; este archivo dice cómo cambiarlo sin romper el pipeline.

## Qué es este repo

Prototipo de referencia de la SPA **jQuery SPA with Method Load from jQuery v5**. Los proyectos nuevos de este tipo se copian desde aquí. Un cambio en el plugin, el navbar, el servidor o Gulp es un cambio de plantilla: mantenlo genérico y no lo ates a una sola vista.

## Dónde se edita

| Carpeta | Trato |
|---|---|
| `src/` | Origen de verdad. Aquí va el código nuevo |
| `index.html`, `gulpfile.js`, `spa.config.js`, `packages/spa-server/`, `packages/spa-build/`, `api/`, `infra/`, `types/` | Se editan cuando el cambio lo pide |
| `app/` | Salida de Gulp. No se edita a mano |
| `dist/` | Build de producción. No se edita a mano |
| `src/markdown-shiki/` | HTML generado por `pnpm code-highlight`. Se regenera, no se reescribe |
| `packages/jq-spa-core/src/libs/`, vendors `*.min.js` en el core | Vendors del core. No se reformatean ni se comentan |
| `prompts/` | Notas locales. No forman parte del producto |

Tras tocar `src/`, el navegador lee `app/`. Hay que correr `pnpm refresh` o tener `pnpm dev` en marcha para ver el cambio.

## URL base

El prefijo público vive en `.env` como `SITE_BASE` (plantilla en `.env.example`). No lo hardcodees.

- Node lo lee con `@antonydev/spa-server/site-base.js` (canónico en `packages/spa-server/`). `src/config/site-base.js` reexporta para `src/routes/paths.js`. `@antonydev/spa-build` copia el módulo a `app/config/` según `spa.config.js` → `siteBase`. El `gulpfile.js` raíz y los scripts del paquete build cargan `dotenv/config` antes de importar `base`.
- El navegador lo deduce de `<base href>` (`document.baseURI`). `index.html` guarda el marcador `%SITE_BASE%/`.
- Sass usa `$base: site-base();`. `@antonydev/spa-build` registra esa función con el valor del `.env`.
- `.htaccess` también lleva `%SITE_BASE%`. `htaccessToDist` escribe el valor real en `dist/.htaccess`.

`src/routes/paths.js` reexporta `base`. `routeModulesBase` en `src/spa/spa.js` apunta a `${base}/app/routes` porque el navegador importa los módulos ya copiados.

`DEV_SERVER_PORT` y `PREVIEW_SERVER_PORT` son puertos de partida. Si están ocupados, el servidor prueba los 19 siguientes. `pnpm stop:dev` y `pnpm stop:preview` solo matan el proceso cuyo `cwd` es este proyecto.

## Añadir o cambiar una ruta

1. Crear o editar el módulo en `src/routes/route-*.js` y exportar un objeto `Route`.
2. Registrar `{ id, path, file }` en `src/routes/route-manifest.js`.
3. `path` del manifiesto y `route.path` del módulo tienen que ser idénticos. `file` es el nombre del módulo sin `.js`.
4. El shell va en `src/pages/`, los fragmentos en `src/pages-components/`, los estilos en `src/scss/pages/` y los scripts en `src/scripts/pages/`.
5. Las URLs de la ruta salen de `paths` en `src/routes/paths.js`. Apuntan a `app/`, no a `src/`.
6. Si la ruta declara `MarkdownShikiHtml`, regenerar con `pnpm code-highlight`.

Los tipos están en `types/route.d.js`, `types/route-manifest.d.js` y `types/config-options-spa.d.js`. Un campo nuevo del dominio se documenta ahí con `@typedef` antes de usarlo.

## Plugin y arranque

- El motor es `packages/jq-spa-core/src/plugins/spa-with-method-load-from-jquery/v5/jquery.spa-with-method-load-from-jquery.js`.
- La configuración de este sitio es solo `src/spa/spa.js`. No metas opciones de proyecto dentro del plugin.
- `defaultSettings` define los valores por defecto. `$.extend({}, defaultSettings, options)` produce `settings`.
- `src/main.js` arranca en modo módulo (`isJQueryModule = true`): import ESM, registro del plugin, `spa()` y precarga de jQuery UI tras `window load`. El fallback CDN → local es el otro camino.
- Tras inyectar `components`, `actionsNavbar()` (dentro del plugin SPA) abre y cierra el menú principal y el de themes. El HTML y el SCSS están en `src/components/layout/layout-navbar.html` y `src/scss/components/layout/_layout-navbar.scss`.
- `src/plugins/actions-navbars-with-jquery-jquery-ui/` es una pieza aparte. La SPA v5 no la importa. El comportamiento activo es `actionsNavbar()`.
- La inyección de vistas usa `jQuery.load()` y `.html()`. Ese es el contrato del plugin. No lo sustituyas por `createElement` ni por un router de terceros.

## Consulta MySQL

La página `stack/php-mysql-page` hace `POST` a `app/services/mysql/query.php`. Ese PHP está en `src/services/mysql/query.php` y Gulp lo copia a `app/services/` y luego a `dist/`. El navegador lo pide igual en `pnpm dev` y en Nginx.

La página `stack/node-mysql-page` hace `POST` a `api/mysql/query`, relativo al `<base>`. El handler vive en `api/src/mysql-query.js` y exporta `createApiRouter()`. `packages/spa-server/src/dev-server.js` (import dinámico desde `api/`) y el proceso de producción (`api/src/server.js`, puerto `3200`) montan ese router junto con `api/src/tasks-router.js`. `pnpm preview` no lo monta.

- No cambies el `fetch` de la página PHP a `api/mysql/query`. Son dos entradas del mismo contrato.
- En el VPS, Nginx llega al proceso Node por el `include` de `/etc/nginx/snippets/jquery.antonydev.tech-api.conf` que está en el site file `infra/nginx/jquery.antonydev.tech.conf`. El fragmento se copia a `snippets/` antes de reemplazar el site file. El `location` es `{SITE_BASE}/api/`, no `/api/` en la raíz del dominio. Sin ese proceso, el `POST` cae en `index.html` y responde 405 con HTML.
- La validación de solo lectura vive en el PHP y en `api/src/mysql-query.js`. Si tocas uno, deja el mismo contrato JSON (`ok`, `message`, `columns`, `rows`) o las páginas divergen.
- `src/services/load-env.php` sube directorios hasta encontrar `.env`. En producción ese archivo está junto al `index.html`, no dentro de `app/`.
- Local: Docker, `MYSQL_PORT=3307`, base `jquery_mis_plugins_spa`, archivo `.env`.
- VPS: el MySQL del sistema en el puerto **3306**, la misma base y el usuario `jquery_user` del curso. Las credenciales van en `.env.production`. La plantilla versionada es `.env.production.example`. `deploy.sh` lo sube como `.env` con modo `640` y grupo `www-data`, al web root de PHP y a `/opt/jquery-node-api/.env`. Sin ese grupo, PHP-FPM no lo lee y conecta al 3307 (`Connection refused`).
- No uses la base `jquery_escuelait_classicmodels` para esta página.

### Dependencias de `api/`

`api/` es miembro del workspace de `pnpm-workspace.yaml`. Las versiones compartidas con la raíz se declaran **solo** en el bloque `catalog` de ese archivo y los manifiestos las referencian con `"catalog:"`. Así dev y producción resuelven la misma versión y no hay dos listas que sincronizar a mano.

- `pnpm install` en la raíz cubre las dos zonas: hay un único `pnpm-lock.yaml` versionado.
- `allowBuilds` del workspace deja correr los scripts de `sharp` y `@parcel/watcher`. pnpm 10+ los bloquea por defecto y sin ellos falla el build.
- La versión de Node está fijada en `.nvmrc` (`24.22.3`, la misma del VPS) y declarada en `engines` de los dos `package.json`. Con nvm, `nvm use` la toma del archivo; `pnpm` lo resuelve corepack desde `packageManager`.
- El proceso de producción no instala nada: `deploy.sh` arma el artefacto con `pnpm --filter jquery-node-api deploy .deploy-api --prod` y sube ese directorio, `node_modules` incluido.

## Demos PHP y Express

`stack/php-page` hace `POST` a `app/services/php/validate.php` (`src/services/php/validate.php`). Gulp lo copia igual que el PHP de MySQL. No usa `.env` ni la base.

`stack/node-express-page` hace `GET`, `POST` y `DELETE` a `api/tasks`, relativo al `<base>`. El router está en `api/src/tasks-router.js`. `packages/spa-server/src/dev-server.js` lo monta en `{SITE_BASE}/api`. En producción lo sirve `jquery-node` detrás del fragmento nginx de `infra/`. Preview no ejecuta ese proceso: la página tiene que mostrar el fallo en el DOM.

## Convenciones de código

Al crear o editar `.js` y `.html` de este repo (no vendors):

- Banner de archivo según `skill-format-comment-code`: tras `/*` o `<!--`, las tres líneas siguientes empiezan con 4 espacios y tienen la misma longitud.
- Funciones, objetos y tipos de primer nivel llevan el banner de `skill-javascript` (`-----  \`nombre()\`  -----`).
- Variables, constantes y funciones locales: `/** - \`descripción\` */`. Añade `@type` solo cuando el tipo no se infiere.
- Cada `if`, `else`, `else if`, `for`, `while`, `switch`, `case`, `default`, `try`, `catch`, `finally`, `return`, `throw` y cada llamada que no sea una declaración nueva lleva `//  -----  descripción  -----` justo antes, con la misma sangría.
- `let` y `const`. Funciones flecha. Sin `var`, `alert`, `confirm` ni `prompt`.
- HTML de páginas y componentes: etiquetas semánticas en los `.html` de `src/`. El feedback visual va al DOM, no a diálogos nativos.
- Una línea en blanco entre instrucciones y entre variables hermanas. Tres líneas en blanco entre función y función.
- Comentarios en español, en minúsculas salvo nombres propios, describiendo lo que hace esa línea.
- Tipos de dominio en `types/*.d.js`. Referencia con `/// <reference path="..." />` cuando el archivo los necesite.
- `jsconfig.json` ya incluye `src/`, `types/`, `packages/spa-server/`, `packages/spa-build/`, `spa.config.js`, `api/` y el `gulpfile.js` fino. No conviertas el proyecto a TypeScript ni añadas alias `@/`.
- El pipeline Gulp vive en `packages/spa-build/`; el `gulpfile.js` raíz solo registra tareas. Opciones de carpetas y vendors: `spa.config.js` (plantilla `spa.config.js.example`). En la raíz quedan `gulp` (CLI) y `dotenv` porque el `gulpfile.js` los importa directamente; el resto de dependencias de build están en el manifiesto de `@antonydev/spa-build`.

Este repositorio no es un proyecto Astro. No añadas Prettier, `prettier-plugin-astro` ni `tsconfig` paths salvo que se pida.

No reformatees un archivo entero si el cambio es local. Aplica las convenciones en el código que toques.

## Comandos

```bash
pnpm install
pnpm dev          # reset + watch + servidor en :9876
pnpm stop:dev
pnpm refresh      # regenera app/ sin quedar a la escucha
pnpm code-highlight
pnpm build
pnpm preview      # sirve dist/ en :8765
```

El detalle de cada script está en `package.json` → `scriptsDoc` y en el README.

## Qué no hacer

- No editar `app/`, `dist/` ni el HTML de `src/markdown-shiki/`.
- No añadir dependencias npm si no se piden.
- No declarar `express`, `dotenv` ni `mysql2` fuera del `catalog` de `pnpm-workspace.yaml`. Si una zona necesita otra versión, se añade una entrada al catalog y ambas la referencian.
- No commitear `.env`, `.env.production`, `deploy.sh`, `node_modules/` ni `prompts/`. El `pnpm-lock.yaml` sí se versiona.
- No cambiar `base` en un solo archivo.
- No duplicar lógica de navbar o de carga de rutas fuera del plugin que ya la posee.
- No dar por hecho que el curso `escuelait` y este prototipo deben quedar idénticos: si se trae una mejora, se adapta a la estructura de v5.
