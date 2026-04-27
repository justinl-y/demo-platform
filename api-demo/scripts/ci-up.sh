#!/bin/bash

set -euo pipefail

# COVERAGE can be set via env var (COVERAGE=1 npm run ci-up test)
# or via the -c flag (npm run ci-up -- test -c)
coverage=${COVERAGE:-0}
passthrough=()

for arg in "$@"; do
  if [[ "$arg" == "-c" ]]; then
    coverage=1
  else
    passthrough+=("$arg")
  fi
done

COVERAGE=$coverage TEST_CASE=${TEST_CASE:-} docker compose -p ci -f docker-compose-ci.yml up "${passthrough[@]}"
