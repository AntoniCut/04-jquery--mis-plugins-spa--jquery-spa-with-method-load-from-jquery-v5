# SPEC 01 — `assets/` dentro de `src/`

> **Estado:** Aprovado
> **Depende de:** ninguna (primera spec de `specs/arquitectura/01-framework-en-paquetes.md`)
> **Fecha:** 2026-11-22
> **Objetivo:** Mover `assets/` a `src/assets/` para que Gulp lo copie a `app/assets/` y todas las URLs de estáticos apunten a `app/`.

## Por qué existe

`assets/` es la única carpeta de contenido que vive fuera de `src/` y que el navegador lee fuera de `app/`.
Eso obliga a Gulp, al servidor de desarrollo y al build a tener casos especiales para la raíz.
Antes de extraer `server/` y Gulp a paquetes, el proyecto tiene que seguir una sola regla: `src/` se copia a `app/` y el navegador lee `app/`.

## Alcance

**Entra:**

- Mover `assets/` a `src/assets/` con `git mv` para conservar el historial.
- En `gulpfile.js`:
    - Añadir `paths.src.assetsDir` y `paths.src.assets`.
    - Mover `claseImagesPng` a `src/assets/img/clase-*/*.png`.
    - Crear `copyAssets` con `createCopyTask` (`binary: true`), como `copyFonts`.
    - Registrar `copyAssets` en `buildSources` y en el watch.
    - Eliminar `paths.root.assetsDir`, `paths.root.assets` y la tarea `copyRootAssetsToDist`. `copyStaticAssetsToDist` ya copia `app/**` a `dist/app/`.
- En `server/dev-server.js`: quitar `'assets/**/*'` de `BROWSER_SYNC_FILES`. `app/**/*` ya cubre los estáticos.
- Actualizar las URLs que apuntan a `assets/`:
    - `src/routes/paths.js`: `favicon` pasa a `${base}/app/assets/favicon`.
    - `index.html`: favicon y logo del loader pasan a `app/assets/...`.
    - `src/scss/fonts/_monserrat.scss`: `#{var.$base}/assets/fonts/...` pasa a `#{var.$base}/app/assets/fonts/...` (18 URLs).
    - `src/components/layout/layout-header.html`, `layout-footer.html` y `layout-navbar-themes-jquery-ui.html`: `../../../assets/...` pasa a `../../assets/...` (16 URLs). El plugin resuelve las rutas relativas contra el HTML de origen en `app/components/layout/`.
- Regenerar `src/markdown-shiki/` con `pnpm code-highlight`.
- Actualizar `README.md` (comando `convert-images` y árbol de carpetas) y `scriptsDoc.convert-images` en `package.json`.

**Fuera de alcance (para specs futuras):**

- Extraer `server/` a `@antonydev/spa-server` (SPEC 02).
- Cualquier cambio en el plugin SPA. El comentario de la línea 800 sobre `../../../assets/...` es un ejemplo genérico y no se toca.
- Reorganizar el contenido interno de `assets/` (`favicon/`, `fonts/`, `img/`).
- Cambiar las carpetas vacías `src/fonts/` y `src/pdfs/` que ya declara Gulp.

## Modelo de datos

Esta spec no introduce estructuras de datos nuevas.
Solo cambia rutas en `paths` de `gulpfile.js` y en `paths` de `src/routes/paths.js`.

```js
// gulpfile.js → paths.src
assetsDir: path.join('src', 'assets'),
assets: path.posix.join('src', 'assets', '**/*'),
claseImagesPng: path.posix.join('src', 'assets', 'img', 'clase-*', '*.png'),
```

## Plan de implementación

1. `git mv assets src/assets`. Añadir `paths.src.assets*`, `copyAssets` y moverlo a `buildSources` y al watch. Ajustar `claseImagesPng`. Verificar que `pnpm refresh` crea `app/assets/`.
2. Actualizar `src/routes/paths.js`, `index.html` y `_monserrat.scss`. Verificar en `pnpm dev` que el favicon, el loader y la fuente Montserrat cargan sin 404.
3. Actualizar los tres HTML de `src/components/layout/`. Verificar en `pnpm dev` que los logos del header, del footer y del navbar de themes cargan sin 404 y con una sola petición por imagen.
4. Eliminar `paths.root.assets*` y `copyRootAssetsToDist` del build y quitar `'assets/**/*'` de `BROWSER_SYNC_FILES`. Verificar que `pnpm build` genera `dist/app/assets/` y que no existe `dist/assets/`.
5. Regenerar `src/markdown-shiki/` con `pnpm code-highlight` y actualizar `README.md` y `scriptsDoc`.

## Criterios de aceptación

- [ ] No existe la carpeta `assets/` en la raíz del proyecto.
- [ ] `git log --follow src/assets/favicon/jquery-icon.svg` muestra el historial anterior al movimiento.
- [ ] `rg "assets/" src index.html server --glob '!src/markdown-shiki/**' --glob '!src/plugins/**'` solo devuelve rutas que empiezan por `app/assets/`, `${base}/app/assets/`, `#{var.$base}/app/assets/` o `../../assets/`, o rutas de `paths.src` en Gulp.
- [ ] `gulpfile.js` no contiene `paths.root.assets`, `paths.root.assetsDir` ni `copyRootAssetsToDist`.
- [ ] `pnpm refresh` crea `app/assets/favicon/`, `app/assets/fonts/` y `app/assets/img/`.
- [ ] En `pnpm dev`, navegar todas las rutas del manifiesto no produce ningún 404 en la pestaña Network.
- [ ] En `pnpm dev`, cada logo del layout se pide una sola vez.
- [ ] Editar un archivo de `src/assets/` con `pnpm dev` en marcha lo copia a `app/assets/` y recarga el navegador.
- [ ] `pnpm convert-images` encuentra los PNG en `src/assets/img/clase-*`, o imprime el aviso de que no hay PNG.
- [ ] `pnpm build` genera `dist/app/assets/` y no genera `dist/assets/`.
- [ ] `pnpm preview` muestra el favicon, la fuente y los logos sin 404.

## Decisiones

- **Sí:** URL pública `app/assets/...`. Una sola regla para el navegador: todo sale de `app/`.
- **No:** mantener `assets/...` en la URL copiando a la raíz de la salida. Es la excepción que esta spec elimina.
- **Sí:** `git mv` en vez de copiar y borrar. Conserva el historial de las imágenes.
- **Sí:** reutilizar `createCopyTask` con `binary: true`. Es el patrón de `copyFonts` y `copyPdfs`.
- **Sí:** borrar `copyRootAssetsToDist`. `copyStaticAssetsToDist` ya publica `app/**` en `dist/`.
- **No:** tocar el plugin SPA. Su reescritura de URLs relativas ya funciona con la nueva profundidad.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Se olvida una URL y aparece un 404 solo en una ruta concreta | El criterio de `rg` y la navegación de todas las rutas del manifiesto en `pnpm dev` y `pnpm preview` |
| Caché del navegador o del VPS sirviendo `assets/` antiguo | Las URLs nuevas son distintas, así que no hay colisión. El `dist/assets/` del VPS queda huérfano y se borra en el siguiente `deploy.sh` |
| `src/markdown-shiki/` muestra rutas viejas en los bloques de código | El paso 5 lo regenera con `pnpm code-highlight` |

## Qué **no** entra en esta spec

- Extraer `server/`, Gulp, el core de jQuery o el efecto de loading a paquetes.
- Cambios en el plugin SPA.
- Reorganizar las subcarpetas de `src/assets/`.
- Soporte de `.ts`.
