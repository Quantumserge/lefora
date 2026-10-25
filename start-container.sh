#!/usr/bin/env bash
set -euo pipefail

# A fresh deployment starts with the committed, real reference cohort so the
# library is useful before anyone uploads a nursery photo.
python -m plantreadiness.seed \
  --db "${PLANT_READINESS_DB_PATH:-/app/plant_readiness.db}" \
  --csv /app/data/super_orange_growth_data.csv \
  --models-dir /app/models

python -m gunicorn --workers 1 --bind 127.0.0.1:8000 backend.app:app &
api_pid=$!
(cd /app/nextjs && npm start -- --hostname 0.0.0.0) &
web_pid=$!

shutdown() {
  kill -TERM "$api_pid" "$web_pid" 2>/dev/null || true
  wait "$api_pid" "$web_pid" 2>/dev/null || true
}
trap shutdown TERM INT EXIT
wait -n "$api_pid" "$web_pid"
