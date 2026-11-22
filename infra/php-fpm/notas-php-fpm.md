# PHP-FPM — notas de producción (jquery-spa-with-method-load-from-jquery-v5)

Resumen operativo de cómo PHP-FPM debe leer el `.env` en el VPS. No es
configuración de pool: es la checklist que evita el fallo clásico de
`Access denied` o `Connection refused` con MySQL.

## Dueño y permisos del .env

- PHP-FPM corre como `www-data`. El `.env` debe ser legible por ese usuario.
- El `deploy.sh` sube `.env.production` como `.env` con modo `640` y grupo
  `www-data`. Así PHP-FPM lo lee y nadie más.
- Si el archivo queda `root:root 600`, PHP-FPM lo ignora: no ve
  `MYSQL_PORT` y cae al puerto por defecto `3307`. En el VPS nadie escucha
  ahí y MySQL responde `Connection refused`.

## Variables que lee el endpoint

`src/services/mysql/query.php` acepta `MYSQL_*` con fallback a `DB_*`:

- `MYSQL_HOST` / `DB_HOST` (default `127.0.0.1`)
- `MYSQL_PORT` / `DB_PORT` (default `3307`)
- `MYSQL_USER` / `DB_USER` (default `jquery_user`)
- `MYSQL_DATABASE` / `DB_NAME` (default `jquery_mis_plugins_spa`)
- `MYSQL_PASSWORD` / `DB_PASS`

En producción esas variables viven en el `.env` del directorio del sitio
y las carga `src/services/load-env.php` subiendo carpetas. El mismo archivo
se copia a `/opt/jquery-node-api/.env` para el proceso Node.

## Puerto de producción

El default del código es `3307`, el del Docker local. En el VPS el MySQL
del sistema escucha en `3306`. Ese puerto tiene que estar en `MYSQL_PORT`
dentro del `.env` de producción.
