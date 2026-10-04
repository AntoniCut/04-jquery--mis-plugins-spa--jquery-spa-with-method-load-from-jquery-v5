# AGENTS.md

Guía para agentes que editen este repositorio. El README describe el producto; este archivo dice cómo cambiarlo sin romper el pipeline.

## Qué es este repo

Prototipo de referencia de la SPA **jQuery SPA with Method Load from jQuery v5**. Los proyectos nuevos de este tipo se copian desde aquí. Un cambio en el plugin, el navbar, el servidor o Gulp es un cambio de plantilla: mantenlo genérico y no lo ates a una sola vista.

## Dónde se edita

| Carpeta | Trato |
|---|---|
| `src/` | Origen de verdad. Aquí va el código nuevo |
| `index.html`, `gulpfile.js`, `server/`, `types/`, `generate-markdown-shiki.js` | Se editan cuando el cambio lo pide |
| `app/` | Salida de Gulp. No se edita a mano |
| `dist/` | Build de producción. No se edita a mano |
| `src/markdown-shiki/` | HTML generado por `pnpm code-highlight`. Se regenera, no se reescribe |
| `src/libs/jquery/`, `src/libs/jquery-module/`, plugins `*.min.js` | Vendors. No se reformatean ni se comentan |
| `prompts/` | Notas locales. No forman parte del producto |

Tras tocar `src/`, el navegador lee `app/`. Hay que correr `pnpm refresh` o tener `pnpm dev` en marcha para ver el cambio.

## URL base

El prefijo `/mis-plugins-spa/jquery-spa-with-method-load-from-jquery-v5` tiene que ser el mismo en:

- `index.html` → `<base href>`
- `src/routes/paths.js` → `base`
- `server/dev-server.js` y `server/preview-server.js` → `DEV_ROUTE_BASE`

`routeModulesBase` en `src/spa/spa.js` apunta a `${base}/app/routes` porque el navegador importa los módulos ya copiados.

## Añadir o cambiar una ruta

1. Crear o editar el módulo en `src/routes/route-*.js` y exportar un objeto `Route`.
2. Registrar `{ id, path, file }` en `src/routes/route-manifest.js`.
3. `path` del manifiesto y `route.path` del módulo tienen que ser idénticos. `file` es el nombre del módulo sin `.js`.
4. El shell va en `src/pages/`, los fragmentos en `src/pages-components/`, los estilos en `src/scss/pages/` y los scripts en `src/scripts/pages/`.
5. Las URLs de la ruta salen de `paths` en `src/routes/paths.js`. Apuntan a `app/`, no a `src/`.
6. Si la ruta declara `MarkdownShikiHtml`, regenerar con `pnpm code-highlight`.

Los tipos están en `types/route.d.js`, `types/route-manifest.d.js` y `types/config-options-spa.d.js`. Un campo nuevo del dominio se documenta ahí con `@typedef` antes de usarlo.

## Plugin y arranque

- El motor es `src/plugins/spa-with-method-load-from-jquery/v5/jquery.spa-with-method-load-from-jquery.js`.
- La configuración de este sitio es solo `src/spa/spa.js`. No metas opciones de proyecto dentro del plugin.
- `defaultSettings` define los valores por defecto. `$.extend({}, defaultSettings, options)` produce `settings`.
- `src/main.js` arranca en modo módulo (`isJQueryModule = true`): import ESM, registro del plugin, `spa()` y precarga de jQuery UI tras `window load`. El fallback CDN → local es el otro camino.
- Tras inyectar `components`, `actionsNavbar()` (dentro del plugin SPA) abre y cierra el menú principal y el de themes. El HTML y el SCSS están en `src/components/layout/layout-navbar.html` y `src/scss/components/layout/_layout-navbar.scss`.
- `src/plugins/actions-navbars-with-jquery-jquery-ui/` es una pieza aparte. La SPA v5 no la importa. El comportamiento activo es `actionsNavbar()`.
- La inyección de vistas usa `jQuery.load()` y `.html()`. Ese es el contrato del plugin. No lo sustituyas por `createElement` ni por un router de terceros.

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
- `jsconfig.json` ya incluye `src/`, `types/`, `server/` y `gulpfile.js`. No conviertas el proyecto a TypeScript ni añadas alias `@/`.

Este repositorio no es un proyecto Astro. No añadas Prettier, `prettier-plugin-astro` ni `tsconfig` paths salvo que se pida.

No reformatees un archivo entero si el cambio es local. Aplica las convenciones en el código que toques.

## Comandos

```bash
pnpm install
pnpm dev          # reset + watch + servidor en :3000
pnpm stop:dev
pnpm refresh      # regenera app/ sin quedar a la escucha
pnpm code-highlight
pnpm build
pnpm preview      # sirve dist/ en :4173
```

El detalle de cada script está en `package.json` → `scriptsDoc` y en el README.

## Qué no hacer

- No editar `app/`, `dist/` ni el HTML de `src/markdown-shiki/`.
- No añadir dependencias npm si no se piden.
- No commitear `.env`, `deploy.sh`, `node_modules/` ni `prompts/`.
- No cambiar `base` en un solo archivo.
- No duplicar lógica de navbar o de carga de rutas fuera del plugin que ya la posee.
- No dar por hecho que el curso `escuelait` y este prototipo deben quedar idénticos: si se trae una mejora, se adapta a la estructura de v5.
