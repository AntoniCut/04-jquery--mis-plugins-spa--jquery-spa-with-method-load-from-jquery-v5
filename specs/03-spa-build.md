# SPEC 03 — `@antonydev/spa-build`

> **Estado:** Implementado
> **Depende de:** SPEC 02 implementada (`specs/02-spa-server.md`)
> **Referencia:** SPEC 03 en `specs/arquitectura/01-framework-en-paquetes.md`
> **Fecha:** 2026-11-22
> **Objetivo:** Extraer `gulpfile.js` y el motor de `generate-markdown-shiki.js` al paquete `@antonydev/spa-build`, configurable con `spa.config.js` en la raíz, sin cambiar el comportamiento de `pnpm refresh`, `pnpm dev`, `pnpm build`, `pnpm code-highlight` ni `pnpm convert-images`.

## Por qué existe

Después de SPEC 02, Gulp y Shiki siguen siendo el bloque más grande de “motor” en la raíz del repo (~1.6k líneas en `gulpfile.js`).
Ese código es igual en cada proyecto copiado del prototipo; el desarrollador solo debería mantener contenido en `src/`, `index.html` y configuración.
SPEC 03 cierra la forma de `spa.config.js` (decisión pendiente del mapa de arquitectura) y deja listo el tercer paquete del workspace.

## Alcance

**Entra:**

- Crear `packages/spa-build/` con nombre npm `@antonydev/spa-build` (`"type": "module"`, `"private": true` en el piloto).
- Registrar el paquete en `pnpm-workspace.yaml` (`packages/spa-build` o `packages/*`).
- Declarar en la raíz `"@antonydev/spa-build": "workspace:*"` en `devDependencies`.
- Mover dependencias de build del `package.json` raíz al manifiesto del paquete, vía `catalog:` cuando aplique:
    - `gulp`, `gulp-*`, `sass`, `del`, `sharp`, `shiki` (y lo que el motor Shiki use: hoy `shiki` directo; `markdown-it` / `markdown-it-shiki` solo si el paquete los necesita — hoy el generador usa `codeToHtml` de `shiki`).
- `pnpm-workspace.yaml`: asegurar `allowBuilds` para `sharp` y `@parcel/watcher` (sigue siendo necesario para Gulp).
- Introducir **`spa.config.js`** en la raíz del proyecto (dueño del desarrollador). El paquete lo importa con `import config from '<projectRoot>/spa.config.js'` (ruta absoluta desde `process.cwd()`). No leer opciones de build desde `package.json`.
- Mover con `git mv`:
    - `generate-markdown-shiki.js` → `packages/spa-build/src/generate-markdown-shiki.js`
    - El cuerpo de tareas de `gulpfile.js` → módulos bajo `packages/spa-build/src/` (p. ej. `paths.js`, `tasks/copy.js`, `tasks/styles.js`, `tasks/dist.js`, `tasks/watch.js`, `register-gulp.js`).
- Dejar en la raíz un **`gulpfile.js` mínimo** que:
    - cargue `dotenv/config` antes de leer `SITE_BASE`;
    - importe `registerGulp` (o nombre acordado) desde `@antonydev/spa-build`;
    - pase `{ projectRoot: process.cwd(), config }` importando `./spa.config.js`;
    - exporte las mismas tareas que hoy (`refresh`, `build`, `watchSrc`, `convertImages`, etc.) para no romper los scripts `gulp …` existentes.
- El paquete obtiene `base` para Sass y para sustituir `%SITE_BASE%` en `index.html` / `.htaccess` importando `@antonydev/spa-server/site-base.js` (misma regla que SPEC 02). **No** duplicar `site-base.js` en `spa-build`.
- `generateMarkdownShiki()` recibe `projectRoot` y rutas desde `spa.config.js`:
    - Escanear `join(projectRoot, config.dirs.routes)` (por defecto `src/routes`) con el mismo criterio que hoy: archivos `route-*.js` excepto `route-manifest.js`;
    - `import()` dinámico de cada módulo de ruta bajo `projectRoot` (el paquete no importa estáticamente archivos de `src/`).
    - Escribir salida en `join(projectRoot, config.dirs.markdownShiki)` (por defecto `src/markdown-shiki`).
- `copyConfig` sigue publicando `site-base` en `app/config/site-base.js`; la ruta del fuente canónico viene de `spa.config.js` (por defecto `packages/spa-server/src/site-base.js`, relativa a `projectRoot`).
- Copia de vendors jQuery / jQuery UI desde `node_modules` (**sigue en esta spec** hasta SPEC 04); la lista de archivos UI puede vivir en `spa.config.js` → `vendor.jqueryUI` o equivalente, con los mismos globs que hoy en `paths.vendor`.
- Tareas de raíz del sitio que no son “contenido SPA” pero el build toca hoy:
    - `minifyRootIndex` lee `spa.config.js` → `root.indexHtml` (default `index.html`);
    - `htaccessToDist` lee `spa.config.js` → `root.htaccess` (default `.htaccess`);
    - sustitución de `%SITE_BASE%` con el valor de `base` (como ahora).
- Actualizar scripts del `package.json` raíz:
    - `code-highlight`: invocar el CLI del paquete o `node packages/spa-build/src/generate-markdown-shiki.js` con `cwd` en la raíz (misma salida en consola que hoy).
    - El resto (`refresh`, `build`, `dev:watch`, `convert-images`, `reset`) sigue siendo `gulp <tarea>` vía el `gulpfile.js` fino.
- `jsconfig.json`: incluir `packages/spa-build`; quitar dependencias de tipos de Gulp del raíz si solo las usa el paquete.
- Documentar en `README.md`, `AGENTS.md` y en comentarios de `spa.config.js.example` (plantilla versionada) la forma del config.
- Tipos de dominio del config en `types/spa-build-config.d.js` (o dentro del paquete y referenciados desde `types/`) con `@typedef` antes de usarlo en código.

**Fuera de alcance (specs futuras):**

- SPEC 04 — `@antonydev/jq-spa-core`, import map, dejar de copiar jQuery desde `node_modules` en Gulp.
- SPEC 05 — `spa-loading-effect`.
- Copiar archivos de navegador de otros paquetes a `app/framework/<paquete>/` (entra con el import map en SPEC 04).
- Publicar `@antonydev/spa-build` en npm.
- Bundler (esbuild/Vite).
- Mover `addTsNoCheck.js` / arreglar `pnpm add:ts-nocheck` si el archivo no existe en el repo (no bloquea esta spec; opcional issue aparte).
- Cambiar el contrato `MarkdownShikiHtml` en las rutas ni el flujo del plugin SPA.

## Modelo de datos — `spa.config.js`

Forma mínima acordada para el piloto (ampliable sin romper proyectos viejos):

```js
// spa.config.js — el desarrollador edita este archivo
/** @type {import('./types/spa-build-config.d.js').SpaBuildConfig} */
export default {
    dirs: {
        src: 'src',
        app: 'app',
        dist: 'dist',
        markdownShiki: 'src/markdown-shiki',
        routes: 'src/routes',
    },
    shiki: {
        theme: 'dark-plus',
        stripHeaderBanner: true,
        routeFilePattern: /^route-.*\.js$/,
        routeManifestFile: 'route-manifest.js',
    },
    siteBase: {
        packageFile: 'packages/spa-server/src/site-base.js',
        appConfigFile: 'app/config/site-base.js',
        srcReexportDir: 'src/config',
    },
    root: {
        indexHtml: 'index.html',
        htaccess: '.htaccess',
    },
    convertImages: {
        pngGlob: 'src/assets/img/clase-*/*.png',
    },
    vendor: {
        // Misma lista que paths.vendor en gulpfile.js actual (hasta SPEC 04).
        jqueryModule: 'node_modules/jquery/dist-module/jquery.module.min.js',
        jqueryUiWidgets: [ /* … */ ],
    },
    // Opcional: copias extra src → app (futuros proyectos).
    extraCopy: [],
};
```

Reglas:

- Rutas en el config son **relativas a `projectRoot`**, no absolutas.
- Puertos, `SITE_BASE` y `CHOKIDAR_*` **siguen en `.env`** (no en `spa.config.js`).
- El paquete no asume nombres de carpetas de contenido distintos sin que el config los declare (defaults = prototipo actual).

## Contrato del paquete (extracto)

```js
// packages/spa-build/package.json (extracto)
{
  "name": "@antonydev/spa-build",
  "exports": {
    "./register-gulp.js": "./src/register-gulp.js",
    "./generate-markdown-shiki.js": "./src/generate-markdown-shiki.js"
  },
  "dependencies": {
    "@antonydev/spa-server": "workspace:*",
    "dotenv": "catalog:",
    "gulp": "^5.0.1"
  }
}
```

`registerGulp({ projectRoot, config })` devuelve el mismo conjunto de tareas exportadas que el `gulpfile.js` actual (nombres estables para scripts y documentación).

## Plan de implementación

1. Añadir `types/spa-build-config.d.js` y `spa.config.js` + `spa.config.js.example` en la raíz (valores = comportamiento actual, sin mover código aún). Verificar que Gulp sigue leyendo paths equivalentes (paso de transición: gulpfile lee config o se mantiene paths hasta el paso 3).
2. Crear `packages/spa-build/package.json`, workspace, catalog de deps de build, `pnpm install`.
3. `git mv` de `generate-markdown-shiki.js`; parametrizar `projectRoot` y `config`; cablear `pnpm code-highlight`.
4. Extraer módulos del `gulpfile.js` al paquete; implementar `registerGulp`; reducir el `gulpfile.js` raíz a ~15–40 líneas.
5. Mover `devDependencies` de build del raíz al paquete; actualizar lockfile.
6. `AGENTS.md`, `README.md`, `jsconfig.json`. Marcar criterios de aceptación.

## Criterios de aceptación

- [x] Existe `packages/spa-build/` como `@antonydev/spa-build` en el workspace.
- [x] Existe `spa.config.js` en la raíz y `spa.config.js.example` versionado; la doc explica cada sección usada en el piloto.
- [x] El `gulpfile.js` de la raíz no contiene lógica de tareas (solo registro + config); `rg` sobre helpers como `createCopyTask` en la raíz no devuelve coincidencias.
- [x] `pnpm install` en la raíz instala el workspace sin errores.
- [x] `git log --follow packages/spa-build/src/generate-markdown-shiki.js` muestra historial previo al movimiento desde la raíz.
- [x] `pnpm refresh` regenera `app/` y `app/config/site-base.js` igual que antes (Sass `site-base()`, rutas del navegador).
- [x] `pnpm code-highlight` genera `src/markdown-shiki/` con el mismo conteo de bloques que antes del refactor (misma condición de rutas con `MarkdownShikiHtml`).
- [x] `pnpm dev` / `pnpm dev:watch` recargan al cambiar `src/**/*` y `app/**/*` como antes.
- [x] `pnpm build` produce `dist/` con `index.html`, `.htaccess`, `app/**` minificado y `%SITE_BASE%` sustituido.
- [x] `pnpm convert-images` sigue convirtiendo PNG en `src/assets/img/clase-*`.
- [x] `pnpm preview` tras `pnpm build`: sin 404 en assets ni shell al recorrer el manifiesto.
- [x] Ningún archivo en `packages/spa-build/src/` contiene `import ... from '../../src/` ni rutas estáticas al `src/` del proyecto (solo `join(projectRoot, …)` e `import()` dinámico hacia rutas del sitio).
- [x] `rg 'gulp-sass|gulp-terser' package.json` en la raíz: las deps viven en `packages/spa-build/package.json` (salvo `@types/gulp` en raíz si el IDE lo exige).

## Decisiones

- **Sí:** un solo `spa.config.js` en la raíz; sin campo `spa` en `package.json`.
- **Sí:** `gulpfile.js` fino en la raíz porque Gulp resuelve el archivo por `cwd`.
- **Sí:** `site-base` canónico sigue en `@antonydev/spa-server`; `spa-build` solo importa `base` para Sass y sustitución en dist.
- **Sí:** Shiki y vendors jQuery en el paquete de build hasta SPEC 04 (copia explícita en config, no empaquetado del core).
- **No:** import map ni `app/framework/` en esta spec.
- **No:** mover `index.html`, `.htaccess` ni contenido de `src/` al paquete.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `import()` de rutas falla fuera de la raíz del proyecto | Siempre `projectRoot = process.cwd()` en scripts; documentar en `spa.config.js.example` |
| Sass deja de ver `site-base()` | Registrar la función con `base` del paquete spa-server en el mismo punto que hoy |
| Watch deja de observar `packages/spa-server/.../site-base.js` | Mantener en watchers la ruta de `config.siteBase.packageFile` |
| Proyecto sin `spa.config.js` | El `gulpfile.js` raíz falla con mensaje claro; el ejemplo es obligatorio al clonar |
| Lockfile / catalog desincronizado | Mover versiones al `catalog` en un solo PR; un `pnpm install` en raíz |

## Qué **no** entra en esta spec

- `@antonydev/jq-spa-core`, `spa-loading-effect`, import map.
- Cambiar qué carpetas bajo `src/` existen o sus nombres por defecto sin reflejarlo en defaults de `spa.config.js`.
- Tests automatizados nuevos (los criterios siguen siendo comandos manuales del prototipo).
- Publicación npm de `@antonydev/spa-build`.