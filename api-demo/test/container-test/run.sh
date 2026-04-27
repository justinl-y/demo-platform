#!/bin/bash

set -euo pipefail

testfile=""
[[ -n "${TEST_CASE:-}" ]] && testfile=$(printf "%04.0f" "${TEST_CASE}")

psql -v ON_ERROR_STOP=1 -h db -U "$PGUSER" -d test_template <<-EOSQL
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PGDATABASE';
  DROP DATABASE IF EXISTS $PGDATABASE;
  CREATE DATABASE $PGDATABASE TEMPLATE test_template;
EOSQL

for f in refresh/*; do
  echo "$f"
  if [[ "$f" == *.sql ]]; then
    PGOPTIONS='--client-min-messages=warning' \
    psql -d "$PGDATABASE" -U "$PGUSER" -h db -f "$f"
  elif [[ "$f" == *.js ]]; then
    node "$f"
  fi
done

# if a new test run is started immediately after the last PG can return a
# 'terminating connection due to administrator command' error.
# Cause not identified but probably a old/new connection conflict issue, a small pause avoids this
sleep 4

# run the test files
echo "DB Rebuilt - Test run commencing..."

vitest_exit=0
vitest --run ./integration/${testfile}* || vitest_exit=$?

if [[ "${COVERAGE:-0}" == "1" ]]; then
  rm -f /coverage/*.json

  curl -sf -o /dev/null -m 5 -X POST http://api:8000/_dev/coverage \
    && echo "Coverage flushed" \
    || echo "Coverage flush failed (non-fatal)"

  # --allow-external is required: API source lives outside the test container's cwd (/usr/app)
  c8 report \
    --temp-directory /coverage \
    --allow-external \
    --include '/srv/api/src/**/*.ts' \
    --exclude '**/*.typed.*' \
    --reporter text \
    || echo "Coverage report failed (non-fatal)"
fi

exit $vitest_exit
