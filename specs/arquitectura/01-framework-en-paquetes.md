# 01 — Arquitectura del framework en paquetes

> Carpeta `specs/arquitectura/`: referencia canónica de la arquitectura del proyecto.
> Este documento es el mapa del refactor. Cada paquete se implementa en su propia
> spec numerada de `specs/`. Se diseña para portarse después a `spa-loader-content-html-v5` (JS-SPA-V5).

> **Fecha:** 2026-11-22
> **Objetivo:** Separar el código que el desarrollador no toca en paquetes del workspace de pnpm, publicables en npm más adelante, y dejar en el proyecto solo lo que el desarrollador edita.

## Por qué existe

Hoy el plugin SPA, jQuery, el arranque, los servidores y Gulp viven mezclados con las vistas.
Un proyecto nuevo se crea copiando todo el repo, así que una mejora del motor hay que copiarla a mano a cada proyecto.
El objetivo final es que el motor llegue por `node_modules` y el proyecto solo tenga contenido y configuración.

## Paquetes

Viven en `packages/` y se declaran en `pnpm-workspace.yaml`.
El proyecto los consume con `"workspace:*"`.
El día que se publiquen en npm solo cambia esa versión.

| Paquete | Contenido | Corre en |
|---|---|---|
| `@antonydev/spa-server` | `server/` (dev, preview, stop, puerto libre) y `src/config/site-base.js` | Node, solo local |
| `@antonydev/spa-build` | Tareas de `gulpfile.js` y motor de `generate-markdown-shiki.js` | Node, build |
| `@antonydev/spa-loading-effect` | `src/effects/effect-loading-page.js` | Navegador |
| `@antonydev/jq-spa-core` | `packages/jq-spa-core/src/` (libs jQuery, loaders ESM, plugin SPA v5, `start()`) → `app/framework/jq-spa-core/` | Navegador |

`spa-server`, `spa-build` y `spa-loading-effect` no dependen de jQuery y se diseñan para que JS-SPA-V5 los consuma igual.

## Qué queda en el proyecto

| Carpeta | Dueño | Nota |
|---|---|---|
| `src/spa/spa.js` | Desarrollador | Solo opciones. Se las pasa a `start()` |
| `src/main.js` | Desarrollador | Se reduce a importar `start()` y pasarle las opciones |
| `src/routes/`, `src/pages/`, `src/pages-components/`, `src/components/`, `src/scss/`, `src/scripts/`, `src/services/` | Desarrollador | Contenido de la SPA |
| `src/assets/` | Desarrollador | Imágenes, fuentes y favicons. Sale de la raíz en SPEC 01 |
| `src/plugins/` (p. ej. actions-navbars) | Desarrollador | Plugins de terceros; el core SPA vive en jq-spa-core |
| `spa.config.js` | Desarrollador | Carpetas extra para Gulp y opciones de Shiki |
| `.env` | Desarrollador | Puertos y `SITE_BASE`. No se mueven a `spa.config.js` |
| `index.html` | Desarrollador | Shell con `<base href>` y el import map |
| `api/`, `docker/`, `docker-compose.yml`, `infra/` | Desarrollador | Demos del curso y configuración del sitio. No se empaquetan |
| `types/` | Mixto | Los tipos de cada paquete viajan con él. Los del proyecto se quedan |

## Cómo llega el código de navegador a `app/`

El navegador no resuelve `node_modules` y el proyecto no usa bundler.

1. `@antonydev/spa-build` copia los archivos de navegador de cada paquete a `app/framework/<paquete>/`.
2. `index.html` declara un import map antes de cualquier `<script type="module">`.
3. El código del desarrollador importa por nombre: `import { start } from '@antonydev/jq-spa-core'`.

Las URLs del import map son relativas al `<base href>`, así que siguen la regla de `SITE_BASE` sin hardcodear el prefijo.

## Reglas

- El navegador solo lee `app/`. Todo estático, incluido `src/assets/`, se publica bajo `app/`.
- Ningún paquete lee opciones del proyecto por su cuenta. Las recibe por parámetro (`start(options)`) o desde `spa.config.js`.
- Un paquete no importa archivos de `src/`.
- El contrato del plugin (`jQuery.load()` y `.html()`) no cambia con el refactor.
- Cada spec deja `pnpm dev`, `pnpm build` y `pnpm preview` funcionando.

## Orden de specs

| Spec | Objetivo |
|---|---|
| SPEC 01 — `assets/` en `src/` | Mover `assets/` a `src/assets/` y servirlo desde `app/assets/` |
| SPEC 02 — `@antonydev/spa-server` | Extraer `server/` y `site-base.js` al primer paquete del workspace |
| SPEC 03 — `@antonydev/spa-build` | Convertir `gulpfile.js` y el motor de Shiki en paquete configurable con `spa.config.js` |
| SPEC 04 — `@antonydev/jq-spa-core` | Empaquetar jQuery, el plugin v5 y `start()`, y añadir el import map |
| SPEC 05 — `@antonydev/spa-loading-effect` | Empaquetar el efecto de loading |
| SPEC 06 — Documentación | Actualizar `AGENTS.md`, el README y la guía para crear un proyecto nuevo |

Cada spec se escribe con `/spec` cuando la anterior está implementada.
La ejecución de cada spec se sigue con ODD en `odd/tasks/<spec>.md`, que referencia la spec en vez de copiarla.

## Decisiones

- **Sí:** documento de arquitectura más una spec por paquete. Cada spec cabe en una PR revisable.
- **No:** una sola spec con todo. Toca más de tres zonas y no cabe en una PR.
- **Sí:** `packages/*` dentro de este repo como piloto, con scope `@antonydev/*`. Se extraen a un repo propio cuando JS-SPA-V5 los adopte.
- **No:** repo del framework desde el primer día. Es más fricción mientras la forma de los paquetes no está probada.
- **Sí:** Gulp copia a `app/framework/<paquete>/` y un import map da los nombres. Mantiene el modelo sin bundler.
- **No:** imports con rutas relativas a `app/framework/`. Atan el código del desarrollador a la ruta física.
- **No:** bundler (esbuild o Vite) para resolver `node_modules`. Cambia el modelo de build del prototipo.
- **Sí:** el arranque de `src/main.js` (modo módulo, fallback CDN, precarga de jQuery UI) pasa al core como `start()`.
- **Sí:** cuatro paquetes. jQuery y el plugin van juntos porque el plugin no funciona sin jQuery.
- **No:** separar `@antonydev/jquery-runtime` del core. No hay otro consumidor que lo pida.
- **Sí:** un único `spa.config.js` en la raíz. Puertos y `SITE_BASE` siguen en `.env`.
- **No:** campo `spa` en `package.json` ni un archivo de configuración por herramienta.
- **Sí:** `api/`, `docker/` e `infra/` quedan como código del desarrollador.
- **Sí:** las URLs de `src/assets/` pasan a `app/assets/`. Una sola regla: el navegador lee `app/`.
- **Diferido:** soporte de `.ts` en `src/scripts/`. Necesita una dependencia nueva y va en una spec posterior.

## Decisiones pendientes

- `src/plugins/actions-navbars-with-jquery-jquery-ui/`: **resuelto en SPEC 04** — queda en `src/plugins/` como ejemplo; no lo importa `main.js`.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El import map no llega antes del primer módulo y el import por nombre falla | SPEC 04 lo coloca en `index.html` antes de `main.js` y añade un criterio de aceptación en consola |
| `routeModulesBase` y las URLs de `paths.js` dejan de coincidir con `app/` | Cada spec verifica `pnpm dev` y `pnpm preview` navegando todas las rutas del manifiesto |
| Divergencia con JS-SPA-V5 durante el piloto | Los paquetes compartidos no importan nada de jQuery. El port se registra en `workflow/` |

## Qué **no** entra en este refactor

- Publicar los paquetes en npm.
- Soporte de `.ts`.
- Empaquetar `api/`, `docker/` o `infra/`.
- Portar el refactor a JS-SPA-V5. Va en su propio repo cuando el piloto esté implementado.
