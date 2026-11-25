#!/usr/bin/env bash
# =====================================================================
# Instala Dianova en un VPS Ubuntu (Hostinger) que ya aloja otros sitios.
# Ejecútalo como root dentro de la carpeta del paquete (dianova-paquete/):
#   bash instalar.sh TU-DOMINIO
#
# Qué hace:
#   1. Instala MySQL 8 (Oracle MySQL de los repositorios de Ubuntu, no MariaDB),
#      Java 21 (JRE) y Certbot si faltan.
#   2. Crea la base "dianova" y su usuario con una contraseña aleatoria que solo
#      queda escrita en /etc/dianova/application.properties (permisos 640).
#   3. Instala el JAR en /opt/dianova como servicio systemd "dianova-api",
#      escuchando solo en 127.0.0.1 (no se expone a internet).
#   4. Publica el build de React en /var/www/dianova y agrega un sitio NUEVO de
#      Nginx para TU-DOMINIO que redirige /api/ al JAR.
#
# Qué NO toca: los sitios de Nginx existentes (por ejemplo Nexo Ñuu), el Java
# por defecto del sistema ni las reglas del firewall.
# Es idempotente: si ya existe /etc/dianova/application.properties se conserva.
# El certificado HTTPS se pide después con Certbot (ver el mensaje final).
# =====================================================================
set -euo pipefail

DOMINIO="${1:-}"
if [[ -z "$DOMINIO" ]]; then
  echo "Uso: bash instalar.sh TU-DOMINIO" >&2
  exit 1
fi
if [[ $EUID -ne 0 ]]; then
  echo "Ejecuta este script como root." >&2
  exit 1
fi

AQUI="$(cd "$(dirname "$0")" && pwd)"
if [[ ! -f "$AQUI/dianova-api.jar" || ! -f "$AQUI/web/index.html" ]]; then
  echo "Falta dianova-api.jar o web/index.html en $AQUI" >&2
  exit 1
fi

CONF_DIR=/etc/dianova
CONF="$CONF_DIR/application.properties"
APP_DIR=/opt/dianova
WEB_DIR=/var/www/dianova
SERVICIO=/etc/systemd/system/dianova-api.service

paso() { printf '\n==> %s\n' "$1"; }

# ---------------------------------------------------------------------
paso "Revisando el servidor"
. /etc/os-release
echo "Sistema: $PRETTY_NAME"
if [[ "${ID:-}" != "ubuntu" ]]; then
  echo "Este script está pensado para Ubuntu (aquí: ${ID:-desconocido}). Detente y revisa." >&2
  exit 1
fi
if dpkg-query -W -f='${Status}' mariadb-server 2>/dev/null | grep -q 'install ok installed'; then
  echo "MariaDB está instalado y el proyecto exige MySQL. No se continúa." >&2
  exit 1
fi
if ! command -v nginx >/dev/null; then
  echo "Nginx no está instalado; se instalará."
fi

IP_LOCAL="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' || true)"
IP_DOMINIO="$(getent ahostsv4 "$DOMINIO" 2>/dev/null | awk 'NR==1 {print $1}' || true)"
echo "IP del VPS: ${IP_LOCAL:-?}   ·   $DOMINIO apunta a: ${IP_DOMINIO:-(no resuelve todavía)}"
if [[ -n "$IP_LOCAL" && "$IP_DOMINIO" != "$IP_LOCAL" ]]; then
  echo "AVISO: el dominio aún no apunta a este VPS. La instalación sigue, pero Certbot fallará hasta que el DNS esté listo."
fi

# Puerto interno del JAR: se conserva el de una instalación previa o se busca uno libre
if [[ -f "$CONF" ]] && grep -q '^server.port=' "$CONF"; then
  PUERTO="$(grep '^server.port=' "$CONF" | cut -d= -f2 | tr -d '[:space:]')"
else
  PUERTO=""
  EN_USO="$(ss -ltn | awk 'NR>1 {print $4}')"
  for p in 8090 8091 8092 8093 8094 8095 8096 8097 8098 8099; do
    if ! grep -qE "[:.]$p\$" <<<"$EN_USO"; then
      PUERTO="$p"
      break
    fi
  done
  if [[ -z "$PUERTO" ]]; then
    echo "No hay un puerto libre entre 8090 y 8099." >&2
    exit 1
  fi
fi
echo "Puerto interno de la API: $PUERTO (solo 127.0.0.1)"

# ---------------------------------------------------------------------
paso "Instalando paquetes (MySQL 8, Java 21, Nginx, Certbot)"
export DEBIAN_FRONTEND=noninteractive
# needrestart solo lista los servicios: no reinicia nada de otros proyectos
export NEEDRESTART_MODE=l
JAVA_ANTES="$(readlink -f "$(command -v java 2>/dev/null)" 2>/dev/null || true)"
PAQUETES=(mysql-server openjdk-21-jre-headless curl openssl)
command -v nginx >/dev/null || PAQUETES+=(nginx)
command -v certbot >/dev/null || PAQUETES+=(certbot python3-certbot-nginx)
apt-get update -y
apt-get install -y "${PAQUETES[@]}"

# Si otro proyecto usaba un Java distinto como predeterminado, se respeta
if [[ -n "$JAVA_ANTES" ]]; then
  JAVA_AHORA="$(readlink -f "$(command -v java)")"
  if [[ "$JAVA_AHORA" != "$JAVA_ANTES" ]]; then
    update-alternatives --set java "$JAVA_ANTES"
    echo "Se restauró el Java predeterminado: $JAVA_ANTES"
  fi
fi
JAVA21=""
for j in /usr/lib/jvm/java-21-openjdk-*/bin/java; do
  [[ -x "$j" ]] && JAVA21="$j" && break
done
if [[ -z "$JAVA21" ]]; then
  echo "No se encontró Java 21 en /usr/lib/jvm." >&2
  exit 1
fi
"$JAVA21" -version 2>&1 | sed -n 1p
mysqld --version

# ---------------------------------------------------------------------
paso "Configurando MySQL"
systemctl enable --now mysql
# Usuario de sistema para el servicio
id dianova >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin dianova
install -d -o dianova -g dianova -m 750 "$APP_DIR"
install -d -o root -g dianova -m 750 "$CONF_DIR"

if [[ -f "$CONF" ]]; then
  echo "Ya existe $CONF: se conserva (contraseñas y clave JWT sin cambios)."
  mysql -e "CREATE DATABASE IF NOT EXISTS dianova CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
else
  DB_PASS="$(openssl rand -hex 24)"
  JWT_SECRETO="$(openssl rand -base64 48 | tr -d '\n')"
  mysql <<SQL
CREATE DATABASE IF NOT EXISTS dianova CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'dianova'@'localhost' IDENTIFIED BY '${DB_PASS}';
ALTER USER 'dianova'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON dianova.* TO 'dianova'@'localhost';
FLUSH PRIVILEGES;
SQL

  umask 027
  cat > "$CONF" <<PROPS
# Dianova API en producción (generado por deploy/hostinger/instalar.sh).
# Contiene secretos: NO copiar al repositorio.
spring.application.name=dianova-api
server.address=127.0.0.1
server.port=${PUERTO}
server.forward-headers-strategy=framework
spring.profiles.active=demo

spring.datasource.url=jdbc:mysql://localhost:3306/dianova?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Mexico_City&characterEncoding=UTF-8
spring.datasource.username=dianova
spring.datasource.password=${DB_PASS}

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.default_batch_fetch_size=50
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true

spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

spring.mail.host=localhost
spring.mail.port=25
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

dianova.zona-horaria=America/Mexico_City
dianova.frontend-url=https://${DOMINIO}
dianova.cors-origenes=https://${DOMINIO}
dianova.web.directorio=

dianova.jwt.secreto=${JWT_SECRETO}
dianova.jwt.minutos-expiracion=480
dianova.jwt.emisor=dianova-api

dianova.notificaciones.intervalo-ms=30000
dianova.notificaciones.max-intentos=3
dianova.notificaciones.minutos-reintento=5
dianova.notificaciones.dominios-demo=dianova.test

# Correo (Postfix + DKIM): se activa cuando el servidor de correo esté listo
dianova.notificaciones.correo.habilitado=false
dianova.notificaciones.correo.remitente=no-responder@${DOMINIO}
dianova.notificaciones.correo.nombre-remitente=Dianova

# Twilio (SMS y WhatsApp): se activa con las credenciales reales
dianova.notificaciones.twilio.habilitado=false
dianova.notificaciones.twilio.account-sid=
dianova.notificaciones.twilio.auth-token=
dianova.notificaciones.twilio.numero-sms=
dianova.notificaciones.twilio.numero-whatsapp=whatsapp:+14155238886
dianova.notificaciones.twilio.url-api=https://api.twilio.com

management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never
PROPS
  chown root:dianova "$CONF"
  chmod 640 "$CONF"
  unset DB_PASS JWT_SECRETO
  echo "Configuración creada en $CONF (contraseña de MySQL y clave JWT aleatorias)."
fi

# ---------------------------------------------------------------------
paso "Instalando la API (JAR + systemd)"
install -o dianova -g dianova -m 640 "$AQUI/dianova-api.jar" "$APP_DIR/dianova-api.jar"
cat > "$SERVICIO" <<UNIT
[Unit]
Description=Dianova API (Spring Boot)
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=dianova
Group=dianova
WorkingDirectory=$APP_DIR
ExecStart=$JAVA21 -Xms256m -Xmx512m -jar $APP_DIR/dianova-api.jar --spring.config.additional-location=file:$CONF_DIR/
SuccessExitStatus=143
Restart=always
RestartSec=10
Environment=TZ=America/Mexico_City

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable dianova-api >/dev/null
systemctl restart dianova-api

# ---------------------------------------------------------------------
paso "Publicando el frontend (build estático)"
mkdir -p "$WEB_DIR"
find "$WEB_DIR" -mindepth 1 -delete
cp -a "$AQUI/web/." "$WEB_DIR/"
chown -R root:root "$WEB_DIR"
chmod -R a+rX "$WEB_DIR"

# ---------------------------------------------------------------------
paso "Agregando el sitio de Nginx para $DOMINIO"
if [[ -d /etc/nginx/sites-available && -d /etc/nginx/sites-enabled ]]; then
  SITIO=/etc/nginx/sites-available/dianova.conf
  ENLACE=/etc/nginx/sites-enabled/dianova.conf
else
  SITIO=/etc/nginx/conf.d/dianova.conf
  ENLACE=""
fi
# Si Certbot ya agregó HTTPS a este sitio, no se reescribe
if [[ -f "$SITIO" ]] && grep -q "managed by Certbot" "$SITIO"; then
  echo "$SITIO ya tiene HTTPS de Certbot: se conserva."
else
  RESPALDO_SITIO=""
  [[ -f "$SITIO" ]] && RESPALDO_SITIO="$(mktemp)" && cp "$SITIO" "$RESPALDO_SITIO"
  sed -e "s/__DOMINIO__/$DOMINIO/g" -e "s/__PUERTO__/$PUERTO/g" "$AQUI/nginx-dianova.conf" > "$SITIO"
  [[ -n "$ENLACE" ]] && ln -sf "$SITIO" "$ENLACE"
  if ! nginx -t; then
    echo "La configuración de Nginx no es válida; se revierte el sitio de Dianova." >&2
    if [[ -n "$RESPALDO_SITIO" ]]; then cp "$RESPALDO_SITIO" "$SITIO"; else rm -f "$SITIO" "$ENLACE"; fi
    exit 1
  fi
fi
systemctl reload nginx

# ---------------------------------------------------------------------
paso "Esperando a que la API arranque (Flyway crea las tablas y el seeder carga los datos)"
for i in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$PUERTO/api/salud" >/dev/null 2>&1; then
    curl -fsS "http://127.0.0.1:$PUERTO/api/salud"; echo
    break
  fi
  sleep 3
  if [[ $i -eq 60 ]]; then
    echo "La API no respondió en 3 minutos. Revisa: journalctl -u dianova-api -n 80 --no-pager" >&2
    exit 1
  fi
done
systemctl --no-pager --lines=0 status dianova-api | sed -n 1,5p || true

cat <<FIN

=====================================================================
Dianova quedó instalada en HTTP.
  Sitio:  http://$DOMINIO
  API:    http://$DOMINIO/api/salud

Último paso, HTTPS con Let's Encrypt (te pedirá tu correo y aceptar los
términos de Let's Encrypt; elige redirigir HTTP a HTTPS si lo pregunta):

  certbot --nginx -d $DOMINIO

Logs de la API:  journalctl -u dianova-api -f
=====================================================================
FIN
