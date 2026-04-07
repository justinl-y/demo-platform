#!/usr/bin/env bash
set -euo pipefail

compose_cmd=(docker compose -p ci -f docker-compose-ci.yml)

cleanup() {
  if [[ "$STARTED_CONTAINER" == "true" ]]; then
    "${compose_cmd[@]}" rm -fsv db >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

# Check if container is already running
if "${compose_cmd[@]}" ps db 2>/dev/null | grep -q "Up"; then
  STARTED_CONTAINER="false"
else
  "${compose_cmd[@]}" up -d --wait db
  STARTED_CONTAINER="true"
fi

npm run sql:types
