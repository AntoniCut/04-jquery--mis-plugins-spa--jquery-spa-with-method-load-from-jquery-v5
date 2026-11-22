# infra/ — configuración del servidor de producción

El runtime de desarrollo y preview vive en `packages/spa-server/` (`@antonydev/spa-server`). Esta carpeta describe el proceso Node que atiende `{SITE_BASE}/api` en el VPS. Nada de `infra/` se ejecuta con `pnpm dev` ni con `pnpm preview`.

```
infra/
├── nginx/       Site file del dominio + fragmentos: estáticos de v5 y {SITE_BASE}/api Node
├── php-fpm/     Notas operativas (dueño/permisos del .env)
├── systemd/     Unit jquery-node.service
└── provision/   Node 24, directorio /opt y enable de la unit
```

## Las zonas

| Carpeta | Qué es | Cuándo corre |
|---|---|---|
| `api/` | runtime Node: routers compartidos, servidor standalone y dependencias del paquete | dev (`pnpm dev`) y prod (systemd `jquery-node`) |
| `packages/spa-server/` | runtime de desarrollo y preview (Node, php-cgi). Preview no monta `/api` | solo local |
| `src/services/` | endpoints PHP (viajan en el build) | dev (php-cgi) y prod (PHP-FPM) |
| `infra/` | configuración del proceso Node de producción | solo en el VPS |

## Site file del dominio

- `nginx/jquery.antonydev.tech.conf` es el site file completo de `jquery.antonydev.tech`: va en `sites-available` con symlink en `sites-enabled`. No es un fragmento; reemplaza al archivo del VPS.
- También sirve la raíz Astro, v4, udemy y escuelait. Un reemplazo pisa esas locations: el archivo del repo tiene que ser el del VPS, con el `listen` vigente.
- El bloque estático de v5 vive además en `jquery.antonydev.tech-mis-plugins-spa.conf`. El API Node está solo en `jquery.antonydev.tech-api.conf`. El site file lo incluye desde `/etc/nginx/snippets/jquery.antonydev.tech-api.conf`.
- No hay `location ^~ /api/` en la raíz del dominio.
- Se aplica a mano: backup del site file, copia del fragmento a `snippets/`, reemplazo del site file, `nginx -t` y `systemctl reload nginx`. El `include` falla si el fragmento todavía no está en `snippets/`.

## API Node en producción

- Código en `/opt/jquery-node-api`, fuera del web root.
- `jquery-node.service` corre como `www-data`, `Restart=on-failure`, logs en `journalctl -u jquery-node`.
- Escucha en `127.0.0.1:3200`. El puerto `3100` lo usa el API de `javascript.antonydev.tech` en el mismo VPS.
- `nginx/jquery.antonydev.tech-api.conf` hace `proxy_pass http://127.0.0.1:3200/` sobre `{SITE_BASE}/api/`. La barra final quita el prefijo: `{SITE_BASE}/api/health` llega al proceso como `/health`, `{SITE_BASE}/api/tasks` como `/tasks` y `{SITE_BASE}/api/mysql/query` como `/mysql/query`.
- El location no es `/api/` en la raíz del dominio. Las páginas piden `api/tasks` y `api/mysql/query` relativos al `<base>`.
- El `.env` del API en producción es el mismo `.env.production` que usa PHP. Vive en `/opt/jquery-node-api/.env`, `root:www-data 640`. La plantilla versionada es `.env.production.example`. `api/.env.example` es solo la del paquete. Si no define `API_PORT`, el proceso usa `3200`.
- `pnpm dev` monta los mismos routers en `{SITE_BASE}/api` y lee el `.env` de la raíz (MySQL local en el `3307`).
- `pnpm preview` no monta este router. Las páginas Node muestran el fallo en el DOM. PHP con MySQL sigue en `app/services/mysql/query.php`.

## Orden en el VPS

1. Como root, con esta carpeta presente: `bash infra/provision/provision-node-api.sh`.
2. Copiar `nginx/jquery.antonydev.tech-api.conf` a `/etc/nginx/snippets/`. Reemplazar el site file con `nginx/jquery.antonydev.tech.conf`. `nginx -t` y recargar.
3. `./deploy.sh` arma el artefacto del API con `pnpm deploy`, lo sube a `/opt/jquery-node-api` e hace `systemctl restart jquery-node`. El VPS no instala dependencias.

El provision no instala ni reemplaza el motor de base de datos.
