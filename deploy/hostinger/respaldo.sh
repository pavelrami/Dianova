#!/usr/bin/env bash
# Genera el respaldo .sql de la base "dianova" del VPS (estructura + datos).
# Ejecútalo como root:  bash respaldo.sh
# Deja el archivo en /root/dianova_respaldo.sql; cópialo al repositorio como
# database/dianova_respaldo.sql.
set -euo pipefail
SALIDA="${1:-/root/dianova_respaldo.sql}"
mysqldump --databases dianova \
  --single-transaction --routines --triggers --events \
  --no-tablespaces --set-gtid-purged=OFF \
  --default-character-set=utf8mb4 > "$SALIDA"
chmod 600 "$SALIDA"
echo "Respaldo: $SALIDA ($(wc -c < "$SALIDA") bytes)"
mysql -N -e "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema='dianova' ORDER BY table_name;"
