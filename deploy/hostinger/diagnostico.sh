#!/usr/bin/env bash
# Diagnóstico de SOLO LECTURA del VPS antes de instalar Dianova.
# No instala, no reinicia y no cambia nada. Ejecútalo como root:
#   bash diagnostico.sh
# y comparte la salida completa.

seccion() { printf '\n===== %s =====\n' "$1"; }

seccion "Sistema"
. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME"
uname -m
nproc
free -h | head -2
df -h / | tail -1

seccion "Puertos en escucha (TCP)"
ss -ltnp 2>/dev/null | awk 'NR>1 {print $4, $6}' | sort -u

seccion "Java"
if command -v java >/dev/null; then
  readlink -f "$(command -v java)"
  java -version 2>&1 | head -1
else
  echo "java no instalado"
fi
ls /usr/lib/jvm 2>/dev/null

seccion "MySQL / MariaDB"
dpkg -l 2>/dev/null | awk '/^ii/ && ($2 ~ /mysql-server|mariadb-server|mysql-client|mariadb-client/) {print $2, $3}'
command -v mysqld mysql mariadb 2>/dev/null || echo "sin binarios de MySQL/MariaDB"

seccion "Nginx"
nginx -v 2>&1
systemctl is-active nginx 2>/dev/null
ls -l /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null
grep -rhoE "server_name[^;]*;|listen[^;]*;|proxy_pass[^;]*;|root[^;]*;" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | sort | uniq -c

seccion "Apache"
systemctl is-active apache2 2>/dev/null || echo "apache2 no activo"

seccion "Certbot"
if command -v certbot >/dev/null; then
  readlink -f "$(command -v certbot)"
  certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains|Expiry"
else
  echo "certbot no instalado"
fi

seccion "Firewall"
ufw status 2>/dev/null | head -15 || echo "ufw no disponible"

seccion "Servicios en ejecución"
systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null \
  | awk '{print $1}' \
  | grep -vE '^(systemd-|dbus|getty|cron|ssh|rsyslog|polkit|snapd|unattended|user@|udisks|multipathd|serial-getty|qemu|ModemManager|networkd-dispatcher|packagekit|fwupd|irqbalance|chrony|atd)'

seccion "Docker"
if command -v docker >/dev/null; then
  docker ps --format '{{.Names}}  {{.Image}}  {{.Ports}}' 2>/dev/null
else
  echo "docker no instalado"
fi

seccion "Node"
command -v node >/dev/null && node -v || echo "node no instalado"

seccion "Instalación previa de Dianova"
ls -ld /opt/dianova /etc/dianova /var/www/dianova 2>/dev/null || echo "no hay instalación previa"
systemctl is-active dianova-api 2>/dev/null || true
