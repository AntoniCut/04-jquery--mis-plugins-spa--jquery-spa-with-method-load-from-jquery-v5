# infra/ — configuración del servidor de producción

El runtime de desarrollo sigue en `server/`. Esta carpeta solo describe el proceso Node que atiende `https://jquery.antonydev.tech/api` en el VPS.

```
infra/
├── nginx/       Fragmento location ^~ /api/ para el server {} del dominio
├── systemd/     Unit jquery-node.service
└── provision/   Node 24, directorio /opt y enable de la unit
```

## Orden

1. En el VPS, como root, con esta carpeta presente: `bash infra/provision/provision-node-api.sh`.
2. Pegar `nginx/jquery.antonydev.tech-api.conf` dentro del `server {}` de `jquery.antonydev.tech`. `nginx -t` y recargar.
3. `./deploy.sh` sube `api/` a `/opt/jquery-node-api`, instala dependencias de producción y hace `systemctl restart jquery-node`.

## Proceso

- Código en `/opt/jquery-node-api`, fuera del web root.
- `jquery-node.service` corre como `www-data`, `Restart=on-failure`, logs en `journalctl -u jquery-node`.
- Escucha en `127.0.0.1:3200`. El puerto 3100 lo usa el API de `javascript.antonydev.tech` en el mismo VPS.
- `proxy_pass http://127.0.0.1:3200/` quita el prefijo: `/api/health` llega al proceso como `/health` y `/api/tasks` como `/tasks`.
- El `.env` del API es `.env.production` subido a `/opt/jquery-node-api/.env` con modo `640` y dueño `root:www-data`. Si no define `API_PORT`, el proceso usa 3200.
- `pnpm preview` no monta este router. La página Express muestra el fallo en el DOM.
- MySQL de la página `stack/mysql-page` sigue en PHP. Este proceso no abre la base.
