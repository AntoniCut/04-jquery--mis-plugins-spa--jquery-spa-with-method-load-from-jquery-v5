#!/usr/bin/env bash
# ==============================================================
#  provision-node-api.sh — proceso Node de jquery.antonydev.tech
#  --------------------------------------------------------------
#  Instala Node 24 si falta, crea /opt/jquery-node-api y habilita
#  la unit jquery-node. No toca MySQL, PHP ni otros sites.
#
#  USO (en el VPS, como root, con esta carpeta infra/ presente):
#      bash infra/provision/provision-node-api.sh
#
#  El fragmento de nginx no se inserta solo. Va dentro del
#  server {} de jquery.antonydev.tech y se recarga con nginx -t.
#  El código y el arranque llegan con deploy.sh.
# ==============================================================
set -euo pipefail

API_NODE_DIR="/opt/jquery-node-api"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Este script se ejecuta como root."
  exit 1
fi

echo "==> Comprobando Node..."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"

if [ "$NODE_MAJOR" -lt 24 ]; then
  echo "==> Instalando Node 24..."
  apt-get update -y
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi

echo "==> Habilitando pnpm con corepack..."
corepack enable
corepack prepare pnpm@latest --activate

echo "==> Creando el directorio del API Node..."
install -d -o www-data -g www-data -m 755 "$API_NODE_DIR"

echo "==> Instalando la unit de systemd..."
install -m 644 "$INFRA_DIR/systemd/jquery-node.service" /etc/systemd/system/jquery-node.service
systemctl daemon-reload
systemctl enable jquery-node

echo "==> Provision del API Node completada."
echo "    1. Copiar infra/nginx/jquery.antonydev.tech-api.conf dentro del server {}."
echo "    2. nginx -t && systemctl reload nginx"
echo "    3. Subir api/ con deploy.sh; el deploy arranca jquery-node."
echo "    4. Verificar: systemctl is-active jquery-node y curl https://jquery.antonydev.tech/api/health."
