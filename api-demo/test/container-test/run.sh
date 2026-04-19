#!/bin/bash

set -euo pipefail

[[ -z "${TEST_CASE}" ]] && testfile="" || testfile=$(printf "%04.0f" "${TEST_CASE}")

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

vitest --run ./integration/${testfile}*
