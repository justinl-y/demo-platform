#!/usr/bin/env bash
set -euo pipefail

compose_cmd=(docker compose -p ci -f docker-compose-ci.yml)
STARTED_CONTAINER="false"

cleanup() {
  if [[ "$STARTED_CONTAINER" == "true" ]]; then
    "${compose_cmd[@]}" rm -fsv db >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

# Check if container is already running
if "${compose_cmd[@]}" ps db 2>/dev/null | grep -q "Up"; then
  :
else
  STARTED_CONTAINER="true"
  "${compose_cmd[@]}" up -d --wait db
fi

npm run sql:types
