# SPEC 05 — `@antonydev/spa-loading-effect`

> **Estado:** Borrador
> **Depende de:** SPEC 04 implementada (`specs/04-jq-spa-core.md`)
> **Referencia:** SPEC 05 en `specs/arquitectura/01-framework-en-paquetes.md`
> **Fecha:** 2026-11-22
> **Objetivo:** Empaquetar `effect-loading-page.js` en `@antonydev/spa-loading-effect`, publicarlo en `app/framework/spa-loading-effect/`, resolverlo por import map y dejar `src/main.js` sin import relativo a `src/effects/`.

## Por qué existe

Tras SPEC 04, el arranque jQuery/SPA vive en jq-spa-core, pero el **loader inicial** sigue en `src/effects/effect-loading-page.js` y se copia a `app/effects/`. Es el mismo patrón que el core: motor reutilizable que el desarrollador no debería duplicar en cada proyecto copiado del prototipo.

El efecto depende del DOM de `index.html` (`#loader`, `#layout`) y de los eventos que emite el plugin SPA (`spa:first-route-loaded`, `spa:route-load-error`). Esa dependencia es contractual, no un acoplamiento de imports entre paquetes.

## Alcance

**Entra:**

- Crear `packages/spa-loading-effect/` con nombre npm `@antonydev/spa-loading-effect` (`"type": "module"`, `"private": true` en el piloto).
- Registrar el paquete en `pnpm-workspace.yaml` y `"@antonydev/spa-loading-effect": "workspace:*"` en `devDependencies` de la raíz.
- Mover con `git mv` `src/effects/effect-loading-page.js` → `packages/spa-loading-effect/src/effect-loading-page.js` (o `index.js` exportando `effectLoadingPage`).
- **`@antonydev/spa-build`**:
  - Extender `spa.config.js` → `framework.spaLoadingEffect` (origen en `packages/spa-loading-effect/src`, destino `app/framework/spa-loading-effect/`).
  - Tarea `copyFrameworkSpaLoadingEffect` (o ampliar el modelo de `copyFrameworkJqSpaCore` si conviene un array `frameworkPackages` en una spec posterior; en el piloto basta una tarea dedicada).
  - Dejar de copiar `src/effects/` si la carpeta queda vacía (retirar `copyEffects` del manifiesto o vaciar `src/effects/`).
- **`index.html`**: entrada en el import map, p. ej. `@antonydev/spa-loading-effect` → `./app/framework/spa-loading-effect/effect-loading-page.js`.
- **`src/main.js`**: `import { effectLoadingPage } from '@antonydev/spa-loading-effect'` (sin ruta a `src/effects/`).
- Tipos: `types/spa-loading-effect.d.js` (opciones de timeout, selectores `#loader` / `#layout` si se parametrizan; mínimo: export de `effectLoadingPage()` sin args como hoy).
- `types/spa-loading-effect-package.d.ts` para checkJs del `main.js`.
- Actualizar `jsconfig.json` con `packages/spa-loading-effect`.
- Documentar en README / AGENTS el map y `app/framework/spa-loading-effect/`.

**Fuera de alcance:**

- Mover estilos del loader (`src/scss/components/layout/_loader.scss`, `fade-in` del layout): siguen en el proyecto; el HTML del loader sigue en `index.html`.
- Cambiar el contrato de eventos del plugin SPA.
- SPEC 06 (documentación masiva del curso).
- Publicar en npm.

## Contrato

- **Entrada:** el desarrollador llama `effectLoadingPage()` al inicio de `main.js` (antes o después de `start()` como hoy; mantener el orden actual salvo prueba en contrario).
- **DOM requerido:** `#loader`, `#layout` (como en `index.html` del piloto).
- **Eventos:** escucha `spa:first-route-loaded` y `spa:route-load-error` en `document`; timeout por defecto 6000 ms (comportamiento actual).

## Import map (extracto)

```html
<script type="importmap">
{
    "imports": {
        "@antonydev/spa-loading-effect": "./app/framework/spa-loading-effect/effect-loading-page.js"
    }
}
</script>
```

(Añadir junto a las entradas de jq-spa-core en `index.html`.)

## Plan de implementación

1. Esqueleto `packages/spa-loading-effect`, workspace, `pnpm install`, tipos mínimos.
2. `git mv` de `src/effects/effect-loading-page.js` al paquete; sin imports a `src/` del proyecto.
3. `spa.config.js` + tarea Gulp de copia a `app/framework/spa-loading-effect/`; retirar `copyEffects` si `src/effects/` queda vacío.
4. Import map + `src/main.js`; `pnpm refresh` y comprobar loader en `pnpm dev`.
5. Docs, criterios de aceptación, verificación dev/preview.

## Criterios de aceptación

- [ ] Existe `packages/spa-loading-effect/` como `@antonydev/spa-loading-effect` en el workspace.
- [ ] No queda `src/effects/effect-loading-page.js` (carpeta `src/effects/` vacía o eliminada).
- [ ] `src/main.js` importa `effectLoadingPage` solo por `@antonydev/spa-loading-effect`.
- [ ] `index.html` incluye la entrada del import map antes de `app/main.js`.
- [ ] Tras `pnpm refresh`, existe `app/framework/spa-loading-effect/` y el loader se oculta al cargar la primera ruta (o por timeout/error).
- [ ] `pnpm dev` y `pnpm preview` (tras `build`): misma UX del loader que antes de SPEC 05.
- [ ] `pnpm build` incluye el framework en `dist/app/framework/spa-loading-effect/`.
- [ ] Ningún archivo del paquete importa estáticamente rutas bajo `src/` del proyecto.

## Decisiones

- **Sí:** un paquete solo para el efecto de loading (arquitectura 01).
- **Sí:** import map + `app/framework/spa-loading-effect/`.
- **No:** mover SCSS/HTML del loader (pertenecen al shell del sitio).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `start()` y `effectLoadingPage()` compiten por orden de ejecución | Mantener orden actual de `main.js`; documentar en AGENTS |
| Plugin no emite `spa:first-route-loaded` | Timeout 6 s ya existente; criterio manual en dev |
| Import map sin `./` | Misma regla que SPEC 04 (`./app/framework/...`) |

## Qué **no** entra en esta spec

- Renombrar eventos del plugin.
- Loader configurable por `spa.config.js` (solo si el piloto lo necesita; por defecto sin opciones nuevas).