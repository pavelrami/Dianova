#!/usr/bin/env bash
# Compila y publica Dianova en el VPS. Ejecútalo en el servidor, dentro del repositorio clonado:
#   cd ~/Dianova && git pull && bash deploy/desplegar.sh
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
echo "==> Backend: compilando JAR"
cd "$REPO/backend"
./mvnw -q -B -DskipTests package
sudo install -o dianova -g dianova -m 640 target/dianova-api.jar /opt/dianova/dianova-api.jar

echo "==> Frontend: build estático"
cd "$REPO/frontend"
npm ci
VITE_API_URL=/api npm run build
sudo rsync -a --delete dist/ /var/www/dianova/

echo "==> Reiniciando servicio"
sudo systemctl restart dianova-api
sleep 8
curl -fsS http://127.0.0.1:8080/api/salud && echo
sudo nginx -t && sudo systemctl reload nginx
echo "Listo."
