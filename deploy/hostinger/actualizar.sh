#!/usr/bin/env bash
# Publica una versión nueva de Dianova en un VPS donde ya se ejecutó instalar.sh.
# Ejecútalo como root dentro de la carpeta del paquete nuevo:
#   bash actualizar.sh
# Reemplaza el JAR y el build de React, reinicia el servicio y verifica la salud.
# No toca /etc/dianova/application.properties, la base de datos ni Nginx.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Ejecuta este script como root." >&2
  exit 1
fi
AQUI="$(cd "$(dirname "$0")" && pwd)"
CONF=/etc/dianova/application.properties
if [[ ! -f "$CONF" ]]; then
  echo "No existe $CONF: primero ejecuta instalar.sh TU-DOMINIO" >&2
  exit 1
fi
if [[ ! -f "$AQUI/dianova-api.jar" || ! -f "$AQUI/web/index.html" ]]; then
  echo "Falta dianova-api.jar o web/index.html en $AQUI" >&2
  exit 1
fi
PUERTO="$(grep '^server.port=' "$CONF" | cut -d= -f2 | tr -d '[:space:]')"

echo "==> Respaldo del JAR anterior"
[[ -f /opt/dianova/dianova-api.jar ]] && cp /opt/dianova/dianova-api.jar /opt/dianova/dianova-api.jar.anterior

echo "==> API"
install -o dianova -g dianova -m 640 "$AQUI/dianova-api.jar" /opt/dianova/dianova-api.jar
systemctl restart dianova-api

echo "==> Frontend"
find /var/www/dianova -mindepth 1 -delete
cp -a "$AQUI/web/." /var/www/dianova/
chown -R root:root /var/www/dianova
chmod -R a+rX /var/www/dianova

echo "==> Esperando a la API"
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$PUERTO/api/salud" >/dev/null 2>&1; then
    curl -fsS "http://127.0.0.1:$PUERTO/api/salud"; echo
    echo "Listo."
    exit 0
  fi
  sleep 3
done
echo "La API no respondió. Revisa: journalctl -u dianova-api -n 80 --no-pager" >&2
echo "Para volver a la versión anterior: cp /opt/dianova/dianova-api.jar.anterior /opt/dianova/dianova-api.jar && systemctl restart dianova-api" >&2
exit 1
