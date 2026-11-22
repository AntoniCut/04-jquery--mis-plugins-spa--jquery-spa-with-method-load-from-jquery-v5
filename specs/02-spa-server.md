# SPEC 02 — `@antonydev/spa-server`

> **Estado:** Aprobado
> **Depende de:** SPEC 01 implementada (`specs/01-assets-en-src.md`)
> **Referencia:** SPEC 02 en `specs/arquitectura/01-framework-en-paquetes.md`
> **Fecha:** 2026-11-22
> **Objetivo:** Extraer `server/` y el módulo `site-base.js` al primer paquete del workspace pnpm (`@antonydev/spa-server`), sin cambiar el comportamiento de `pnpm dev`, `pnpm preview` ni `pnpm stop:*`.

## Por qué existe

El mapa de arquitectura separa lo que el desarrollador no toca en paquetes reutilizables.
Los servidores de desarrollo y preview, el cierre por puerto y la lectura de `SITE_BASE` en Node son motor compartible, no contenido del sitio.
SPEC 01 unificó los estáticos bajo `app/`; esta spec empieza el workspace de paquetes con el runtime local más aislado.

## Alcance

**Entra:**

- Crear `packages/spa-server/` con nombre npm `@antonydev/spa-server` (`"type": "module"`, `"private": true` en el piloto).
- Registrar el paquete en `pnpm-workspace.yaml` (`packages: - api` → añadir `packages/spa-server` o `packages/*` según convenga al repo).
- Declarar en la raíz `"@antonydev/spa-server": "workspace:*"` en `devDependencies` (solo desarrollo).
- Dependencias del paquete: `dotenv`, `express`, `browser-sync` vía `catalog:` del workspace (añadir `browser-sync` al catalog si aún no está; hoy solo está en el `package.json` raíz).
- Mover con `git mv` desde la raíz al paquete:
    - `server/dev-server.js`
    - `server/preview-server.js`
    - `server/find-available-port.js`
    - `server/stop-dev-server.js`
    - `server/stop-preview-server.js`
    - `server/stop-server-helpers.js`
- Mover `src/config/site-base.js` al paquete (ruta sugerida: `packages/spa-server/src/site-base.js`).
- Exportar `base` desde `package.json` del paquete (`"exports": { "./site-base.js": "./src/site-base.js", ... }`).
- Ajustar imports internos del paquete (rutas relativas entre módulos del paquete).
- Montaje de `api/` en dev: el paquete recibe `projectRoot` (`process.cwd()` del proceso que lanza el script) y resuelve los routers del demo con `import` dinámico a `api/src/mysql-query.js` y `api/src/tasks-router.js` (mismo contrato que hoy). El paquete no importa nada de `src/` del sitio.
- Dejar en la raíz del proyecto **shims mínimos** (p. ej. `spa-server.dev.mjs`, `spa-server.preview.mjs`, `spa-server.stop-dev.mjs`, `spa-server.stop-preview.mjs`) que llaman al paquete, **o** exponer binarios en el `package.json` del paquete y apuntar `package.json` raíz a ellos. Criterio: **no queda carpeta `server/` con lógica**.
- Actualizar scripts del `package.json` raíz:
    - `serve:dev`, `preview`, `stop:dev`, `stop:preview` invocan el paquete o sus shims (misma semántica que hoy, incluido `preview --open`).
- `stop:*` sigue identificando la instancia por `projectRoot` y por el fragmento del comando que distinga dev vs preview (actualizar el string que hoy es `server/dev-server.js` si cambia la ruta del proceso).
- `gulpfile.js` y `generate-markdown-shiki.js`: importar `base` desde `@antonydev/spa-server/site-base.js` (con `dotenv/config` antes, como ahora).
- `copyConfig` en `gulpfile.js`: copiar `site-base.js` desde el paquete a `app/config/site-base.js` (el navegador sigue importando por ruta relativa en `app/routes/paths.js`; sin import map todavía).
- `src/config/site-base.js`: reexport de una línea `export { base } from '@antonydev/spa-server/site-base.js'` solo para que `paths.js` y el checkJs resuelvan en `src/` (el artefacto del navegador sale de `app/config/` vía Gulp).
- Actualizar `jsconfig.json`: quitar `server`, incluir `packages/spa-server` (y mantener `api/`).
- Actualizar `README.md`, `AGENTS.md` e `infra/README.md` donde citen `server/` como carpeta del repo.
- Versión del lockfile con `pnpm install` en la raíz.

**Fuera de alcance (specs futuras):**

- SPEC 03 — extraer Gulp y Shiki a `@antonydev/spa-build` (solo el mínimo en `copyConfig` para publicar `site-base` en `app/config/`).
- SPEC 04 — import map y `@antonydev/jq-spa-core`.
- Publicar el paquete en npm.
- Cambiar puertos, rangos de fallback, `BROWSER_SYNC_FILES` ni el contrato de montaje `/api` en preview (sigue sin montar API).
- Mover o empaquetar `api/`, `infra/` o `deploy.sh`.

## Modelo de datos

No hay estructuras nuevas de dominio.
Contratos existentes:

- Variables de entorno: `SITE_BASE`, `DEV_SERVER_PORT`, `PREVIEW_SERVER_PORT`, `CHOKIDAR_*` (sin renombrar).
- Export `base` desde `site-base.js` (Node: `SITE_BASE`; navegador: `<base href>`).

```js
// packages/spa-server/package.json (extracto)
{
  "name": "@antonydev/spa-server",
  "exports": {
    "./site-base.js": "./src/site-base.js",
    "./dev-server.js": "./src/dev-server.js",
    "./preview-server.js": "./src/preview-server.js"
  }
}
```

## Plan de implementación

1. Crear `packages/spa-server/package.json`, añadir el paquete al workspace y `pnpm install`. Verificar que la raíz resuelve `@antonydev/spa-server`.
2. `git mv` de `server/*` y `src/config/site-base.js` al paquete. Corregir imports internos. Sin tocar aún los scripts raíz (tests intermedios opcionales).
3. Implementar el arranque con `projectRoot` y carga de routers `api/` como hoy. Eliminar carpeta `server/` vacía.
4. Shims o bins + actualizar `package.json` raíz. Mover `browser-sync` (y `express`/`dotenv` si dejan de usarse solo en raíz para servidores) al manifiesto del paquete.
5. Cablear `gulpfile.js`, `generate-markdown-shiki.js`, `copyConfig` y `src/config/site-base.js` reexport. Regenerar con `pnpm refresh` si hace falta.
6. Documentación y `jsconfig.json`. Verificar criterios de aceptación.

## Criterios de aceptación

- [ ] No existe la carpeta `server/` en la raíz del proyecto (salvo shims acordados en la raíz con otro nombre, sin duplicar lógica).
- [ ] Existe `packages/spa-server/` publicado en el workspace como `@antonydev/spa-server`.
- [ ] `pnpm install` en la raíz instala el workspace sin errores.
- [ ] `git log --follow packages/spa-server/src/site-base.js` (o la ruta final) muestra historial previo al movimiento desde `src/config/site-base.js`.
- [ ] `gulpfile.js` y `generate-markdown-shiki.js` importan `base` desde `@antonydev/spa-server/site-base.js`, no desde `src/config/site-base.js`.
- [ ] `pnpm refresh` crea `app/config/site-base.js` con el mismo comportamiento (Sass `site-base()`, rutas del navegador).
- [ ] `pnpm dev` arranca; la consola muestra la URL con `SITE_BASE`; BrowserSync recarga al cambiar `app/**/*`.
- [ ] En `pnpm dev`, las páginas `stack/node-express-page` y `stack/node-mysql-page` siguen respondiendo en `/api` (mismo comportamiento que antes del refactor).
- [ ] `pnpm preview` sirve `dist/` y no monta API; `stack/node-express-page` sigue mostrando el fallo esperado en el DOM.
- [ ] `pnpm stop:dev` y `pnpm stop:preview` solo matan la instancia de **este** proyecto (`cwd`), no otra copia del repo en otro puerto.
- [ ] Navegar todas las rutas del manifiesto en `pnpm dev` y `pnpm preview` no produce 404 de assets ni del shell.
- [ ] `rg 'from \\.\\./src/config/site-base|from '\\''\\.\\./src/config/site-base' packages server'` no devuelve coincidencias (servidores y paquete no dependen del path viejo).

## Decisiones

- **Sí:** primer paquete en `packages/` dentro del mismo repo (piloto `@antonydev/*`).
- **Sí:** `workspace:*` en la raíz; más adelante versión fija o npm.
- **Sí:** canonical `site-base.js` en el paquete; reexport fino en `src/config/` + copia Gulp a `app/config/` hasta SPEC 04 (import map).
- **Sí:** carga de `api/` desde `projectRoot` con import dinámico; `api/` sigue siendo código del desarrollador.
- **No:** meter lógica de Gulp o del plugin SPA en este paquete.
- **No:** cambiar `.env.example` ni mover puertos a `spa.config.js` (eso es SPEC 03).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `stop:*` deja de reconocer el proceso porque cambió la ruta del script en la línea de comandos | Actualizar el matcher en `stop-server-helpers` y un criterio con `pnpm stop:dev` |
| El navegador no resuelve `@antonydev/...` en módulos copiados a `app/` | No importar el paquete por nombre en código de navegador; solo copiar `site-base.js` plano a `app/config/` |
| `pnpm dev` en otro clon no encuentra `api/` | Import dinámico desde `path.join(projectRoot, 'api/src/...')` documentado en esta spec |
| Lockfile o catalog desincronizado | Un solo `pnpm-lock.yaml`; añadir entradas al `catalog` en vez de versiones sueltas |

## Qué **no** entra en esta spec

- `@antonydev/spa-build`, `jq-spa-core`, `spa-loading-effect`.
- Import map en `index.html`.
- Cambios en el plugin SPA, rutas, vistas o `api/src/*` salvo imports desde los shims de arranque.