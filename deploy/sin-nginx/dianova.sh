#!/usr/bin/env bash
# Arranca, detiene o vigila Dianova en un VPS sin Nginx ni sudo (API + frontend en un solo puerto).
# Uso:  ./dianova.sh iniciar | detener | reiniciar | estado | vigilar
# cron:  @reboot      /opt/proyecto-final/dianova.sh iniciar
#        */5 * * * *  /opt/proyecto-final/dianova.sh vigilar
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
JAR="$DIR/app.jar"
CONF="$DIR/application.properties"
PID="$DIR/dianova.pid"
LOG="$DIR/dianova.log"
PUERTO="$(grep -E '^server.port=' "$CONF" 2>/dev/null | cut -d= -f2)"
PUERTO="${PUERTO:-8086}"

corriendo() { [ -f "$PID" ] && kill -0 "$(cat "$PID")" 2>/dev/null; }

iniciar() {
  if corriendo; then echo "Ya está corriendo (PID $(cat "$PID"))"; return 0; fi
  [ -f "$LOG" ] && [ "$(stat -c%s "$LOG")" -gt 10485760 ] && mv "$LOG" "$LOG.1"
  cd "$DIR" || exit 1
  nohup java -Xms128m -Xmx256m -XX:+UseSerialGC -XX:MaxMetaspaceSize=160m -Duser.timezone=America/Mexico_City \
    -jar "$JAR" --spring.config.location="file:$CONF" >> "$LOG" 2>&1 &
  echo $! > "$PID"
  echo "Iniciado (PID $!) en el puerto $PUERTO. Log: $LOG"
}

detener() {
  if corriendo; then kill "$(cat "$PID")"; sleep 5; corriendo && kill -9 "$(cat "$PID")"; fi
  rm -f "$PID"; echo "Detenido"
}

case "${1:-estado}" in
  iniciar) iniciar ;;
  detener) detener ;;
  reiniciar) detener; iniciar ;;
  estado) if corriendo; then echo "Corriendo (PID $(cat "$PID"))"; curl -fsS "http://127.0.0.1:$PUERTO/api/salud" && echo; else echo "Detenido"; fi ;;
  vigilar) corriendo || { echo "$(date) reinicio automático" >> "$LOG"; iniciar; } ;;
  *) echo "Uso: $0 iniciar|detener|reiniciar|estado|vigilar"; exit 1 ;;
esac
