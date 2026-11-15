# API Node en producción

Objetivo: que `https://jquery.antonydev.tech/api/tasks` lo responda Express, con systemd y nginx, y deje de caer en el HTML de la SPA.
Rama: `feat/api-node-produccion`. Entrega: rama local, sin push.
Verificación: `node --check`, curl del contrato, `pnpm build`, Playwright en dev, preview y la URL pública.

## Specs

S1. La Ola 3 es la spec 10 del JS-SPA: la API Node en producción. Hoy api/tasks solo existe dentro de pnpm dev. En el VPS esa URL cae en el HTML de la SPA. La ola crea el proceso Node de jquery.antonydev.tech, con systemd y el location /api/ de nginx, para que Express responda también en producción. Utiliza Playwright.

S2. El contrato que sale a producción es el de `api/src/tasks-router.js`: GET y POST `/tasks`, DELETE `/tasks/:id`, 3 semillas, 422, 405 con Allow, 413 a 4 KB y `X-Response-Time`. No cambia.

S3. `GET /health` responde `{ "ok": true, "service": "jquery-node-api", "uptime", "timestamp" }` y no toca MySQL. Por defecto el proceso escucha en `127.0.0.1:3200`.

S4. La página pide `/api/tasks` absoluto. `pnpm dev` monta el router en `/api`. Preview no lo monta y la página muestra el fallo en el DOM. MySQL sigue en PHP.

S5. Código en `/opt/jquery-node-api`, unit `jquery-node`, fragmento nginx `location ^~ /api/` con `proxy_pass http://127.0.0.1:3200/`. `deploy.sh` sube `api/`, hace `pnpm install --prod` y `systemctl restart jquery-node`.

## Tasks

- T1. S2 S3. Runtime `api/` y montaje en el dev server. inline. done.
- T2. S4. Fetch absoluto, copia de la página y Shiki. inline. done.
- T3. S5. systemd, nginx, provisión y deploy.sh. inline. done en el repo y en el VPS.
- T4. S4 S5. README, AGENTS.md e infra/README.md. inline. done.
- T5. S1. curl, build, Playwright y deploy al VPS. done.

## Log

L1. 2026-11-15. Ola 3 => La Ola 3 es la spec 10 del JS-SPA: la API Node en producción. Hoy api/tasks solo existe dentro de pnpm dev. En el VPS esa URL cae en el HTML de la SPA. La ola crea el proceso Node de jquery.antonydev.tech, con systemd y el location /api/ de nginx, para que Express responda también en producción. Utiliza Playwright.

L2. 2026-11-15. Implement the plan as specified. El puerto 3200 evita el 3100 de javascript-node en el mismo VPS. El fetch pasa a absoluto porque la URL relativa bajo SITE_BASE no entra en `location /api/`.

L3. 2026-11-15. Verificación local: `node api/src/server.js` en 3200 cumple health, 3 semillas, 201, 422, 200 al borrar, 400, 405 y 413. `pnpm dev` sirve `/api/tasks` y el POST MySQL de `stacks` sigue en 200 con 7 filas; una escritura responde 400. `pnpm build` termina en 0, `dist/app/services/mysql/query.php` existe y `api/` no entra en `dist/`. Playwright en dev: lista, alta 201, baja 200, título corto 422. Preview: `HTTP 404` y el texto "El servidor respondió 404 sin JSON." `systemd-analyze verify` en local falla solo porque `/usr/bin/node` no existe en esta máquina (Node está en nvm).

L4. 2026-11-15. Con la sesión maestra abierta se provisionó `jquery-node`, se insertó `location ^~ /api/` en el server 443 de jquery.antonydev.tech (backup `jquery.antonydev.tech.bak-ola3`) y `./deploy.sh` terminó bien. `https://jquery.antonydev.tech/api/health` responde 200 con `jquery-node-api`. `GET /api/tasks` devuelve 3 semillas. `PUT` responde 405. `/api/.env` y `/api/src/server.js` responden 404. El PHP de MySQL sigue en 200 con 7 filas. Playwright en la URL pública: alta 201, baja 200, título corto 422. `deploy.sh` cierra el ControlMaster al terminar, así que la sesión SSH del usuario se cortó.
