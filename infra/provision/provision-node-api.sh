#!/usr/bin/env bash
# ==============================================================
#  provision-node-api.sh — Node 24 y la unit jquery-node
#  --------------------------------------------------------------
#  Checklist ejecutable en el VPS, como root, desde el checkout:
#      bash infra/provision/provision-node-api.sh
#
#  No instala ni reemplaza MySQL. No copia nginx: el site file y el
#  fragmento del API se aplican a mano. El fragmento va en
#  /etc/nginx/snippets/ y el site file lo incluye.
#  El 3100 lo usa javascript-node. Este proceso usa el 3200.
#  No instala pnpm: deploy.sh envía el artefacto de `pnpm deploy`
#  con sus node_modules ya resueltos. El VPS solo ejecuta Node.
# ==============================================================
set -euo pipefail

API_NODE_DIR="/opt/jquery-node-api"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Instalando Node 24 (si no está)..."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"

if [ "$NODE_MAJOR" -lt 24 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi

echo "==> Creando el directorio del API Node..."
install -d -o www-data -g www-data -m 755 "$API_NODE_DIR"

echo "==> Instalando la unit de systemd del API Node..."
install -m 644 "$INFRA_DIR/systemd/jquery-node.service" /etc/systemd/system/jquery-node.service
systemctl daemon-reload
systemctl enable jquery-node

echo "==> Recordatorio manual (no automatizado):"
echo "    1. Copiar infra/nginx/jquery.antonydev.tech-api.conf a /etc/nginx/snippets/."
echo "       Reemplazar /etc/nginx/sites-available/jquery.antonydev.tech"
echo "       con infra/nginx/jquery.antonydev.tech.conf, tras un backup."
echo "       El location es {SITE_BASE}/api/, no /api/ en la raíz del dominio."
echo "       nginx -t && systemctl reload nginx"
echo "    2. Ejecutar deploy.sh: sube el artefacto del API y el .env de producción a $API_NODE_DIR."
echo "    3. Verificar: systemctl is-active jquery-node"
echo "       curl -s http://127.0.0.1:3200/health"

echo "==> Provision del API Node completada."
