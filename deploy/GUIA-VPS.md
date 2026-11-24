# Guía de despliegue en el VPS (Ubuntu 24.04)

Todo corre en el mismo servidor: **MySQL 8**, la **API Spring Boot** como JAR con systemd, el **frontend React** como build estático servido por **Nginx**, **HTTPS con Let's Encrypt (Certbot)** y **correo propio con Postfix + OpenDKIM**. No se usa Vercel, Railway, SendGrid ni Mailgun.

> Reemplaza `TU-DOMINIO` por tu dominio (por ejemplo `dianova.midominio.com`) y `IP-DEL-VPS` por la IP pública.

## 0. DNS (en el panel de tu dominio)

| Tipo | Nombre | Valor |
|---|---|---|
| A | `TU-DOMINIO` | `IP-DEL-VPS` |
| A | `www` | `IP-DEL-VPS` |
| MX | `TU-DOMINIO` | `TU-DOMINIO` (prioridad 10) |
| TXT (SPF) | `TU-DOMINIO` | `v=spf1 a mx ip4:IP-DEL-VPS -all` |
| TXT (DKIM) | `default._domainkey` | contenido de `/etc/opendkim/keys/TU-DOMINIO/default.txt` (paso 6) |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:postmaster@TU-DOMINIO` |

Además pide a tu proveedor del VPS el **PTR / DNS inverso** de `IP-DEL-VPS` apuntando a `TU-DOMINIO` y que el **puerto 25 de salida** esté abierto (algunos proveedores lo bloquean por defecto).

## 1. Paquetes

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-21-jre-headless mysql-server nginx certbot python3-certbot-nginx \
                    postfix mailutils opendkim opendkim-tools git rsync curl
# Node 22 LTS para compilar el frontend
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
```

Al instalar Postfix elige **Internet Site** y como nombre de correo `TU-DOMINIO`.

## 2. MySQL 8 (no MariaDB)

```bash
mysql --version          # debe decir "Ver 8.x ... MySQL Community Server"
sudo mysql_secure_installation
sudo mysql
```

```sql
CREATE DATABASE dianova CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER 'dianova'@'localhost' IDENTIFIED BY 'UNA_CONTRASEÑA_LARGA';
GRANT ALL PRIVILEGES ON dianova.* TO 'dianova'@'localhost';
FLUSH PRIVILEGES;
```

Las tablas **no** se crean a mano: las crea Flyway (`V1__crear_esquema.sql`, `V2__catalogo_roles.sql`) la primera vez que arranca la API, y `DemoDataSeeder` carga los datos de prueba con el perfil `demo`.

## 3. Usuario del servicio y configuración secreta

```bash
sudo useradd --system --home /opt/dianova --shell /usr/sbin/nologin dianova
sudo mkdir -p /opt/dianova /etc/dianova /var/www/dianova
sudo chown dianova:dianova /opt/dianova
sudo cp backend/src/main/resources/application.properties.example /etc/dianova/application.properties
sudo nano /etc/dianova/application.properties    # BD, JWT (openssl rand -base64 48), dominio, Twilio
sudo chown root:dianova /etc/dianova/application.properties && sudo chmod 640 /etc/dianova/application.properties
```

## 4. Compilar y publicar

```bash
git clone https://github.com/pavelrami/Dianova.git ~/Dianova
sudo cp ~/Dianova/deploy/systemd/dianova-api.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable dianova-api
bash ~/Dianova/deploy/desplegar.sh
curl http://127.0.0.1:8080/api/salud
```

## 5. Nginx + HTTPS con Certbot

```bash
sudo cp ~/Dianova/deploy/nginx/dianova.conf /etc/nginx/sites-available/
sudo sed -i 's/TU-DOMINIO/tu.dominio.real/g' /etc/nginx/sites-available/dianova.conf
sudo ln -s /etc/nginx/sites-available/dianova.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo ufw allow 'Nginx Full' && sudo ufw allow OpenSSH && sudo ufw allow 25/tcp
sudo certbot --nginx -d TU-DOMINIO -d www.TU-DOMINIO --redirect -m tu-correo@ejemplo.com --agree-tos
sudo certbot renew --dry-run     # la renovación automática queda en un timer de systemd
```

## 6. Correo real con Postfix + DKIM

`/etc/postfix/main.cf` (valores clave):

```
myhostname = TU-DOMINIO
mydomain = TU-DOMINIO
myorigin = $mydomain
inet_interfaces = loopback-only      # solo la API local puede enviar
inet_protocols = ipv4
mydestination = localhost
smtpd_tls_security_level = may
smtp_tls_security_level = may
smtpd_tls_cert_file = /etc/letsencrypt/live/TU-DOMINIO/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/TU-DOMINIO/privkey.pem
# OpenDKIM
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = $smtpd_milters
```

Claves DKIM:

```bash
sudo mkdir -p /etc/opendkim/keys/TU-DOMINIO
sudo opendkim-genkey -b 2048 -d TU-DOMINIO -D /etc/opendkim/keys/TU-DOMINIO -s default -v
sudo chown -R opendkim:opendkim /etc/opendkim
sudo cat /etc/opendkim/keys/TU-DOMINIO/default.txt   # copia el valor p=... al TXT default._domainkey
```

Configura `/etc/opendkim.conf`, `key.table`, `signing.table` y `trusted.hosts` como en `deploy/opendkim/opendkim.conf`, luego:

```bash
sudo systemctl restart opendkim postfix
echo "Prueba Dianova" | mail -s "Prueba DKIM" -a "From: no-responder@TU-DOMINIO" tu-correo@gmail.com
sudo tail -f /var/log/mail.log
```

En Gmail abre el mensaje > *Mostrar original*: debe decir **SPF: PASS**, **DKIM: PASS** y **DMARC: PASS**. También puedes enviar a la dirección que te da https://www.mail-tester.com para obtener una calificación.

En `/etc/dianova/application.properties`: `spring.mail.host=localhost`, `spring.mail.port=25`, `dianova.notificaciones.correo.habilitado=true`, `dianova.notificaciones.correo.remitente=no-responder@TU-DOMINIO`.

## 7. SMS y WhatsApp con Twilio

1. Crea una cuenta en https://www.twilio.com (la prueba gratuita da saldo inicial).
2. Copia **Account SID** y **Auth Token** de la consola a `application.properties`.
3. **SMS:** compra o usa el número de prueba de Twilio (`numero-sms`). En cuenta de prueba, verifica antes los números destino en *Verified Caller IDs*.
4. **WhatsApp:** en *Messaging > Try it out > Send a WhatsApp message* activa el **Sandbox**. Cada teléfono que vaya a recibir mensajes debe enviar primero `join <palabra-clave>` al +1 415 523 8886. Usa `numero-whatsapp=whatsapp:+14155238886`.
5. En Dianova, el estudiante registra su teléfono en formato `+52155...` en **Perfil** y activa SMS o WhatsApp en **Notificaciones**.

Acciones reales que disparan los envíos: un docente **publica una tarea** o **programa un evento** de su materia (aviso inmediato por cada canal autorizado), un recordatorio llega a su hora (despachador cada 30 s) o el usuario pulsa **Enviar ahora** en un recordatorio.

## 8. Respaldo de la base de datos

```bash
mysqldump -u dianova -p --single-transaction --routines --triggers dianova > ~/dianova_respaldo_$(date +%F).sql
```

El repositorio incluye `database/dianova_respaldo.sql` generado con datos de demostración.
