#!/bin/sh
set -eu

# Detect when the named Docker volume has stale packages from an old image build:
# if the current lockfile differs, reinstall before starting the server.
# The hash file is created at runtime, not in the Dockerfile.
if [ ! -f node_modules/.install-lock-hash ]; then
  # First time in this volume, create the hash file (no npm ci needed, image has fresh node_modules)
  sha256sum package-lock.json > node_modules/.install-lock-hash
elif ! sha256sum -c node_modules/.install-lock-hash > /dev/null 2>&1; then
  # Hash file exists but doesn't match - package-lock.json changed
  >&2 echo "node_modules is out of sync with package-lock.json — running npm ci..."
  npm ci --legacy-peer-deps
  sha256sum package-lock.json > node_modules/.install-lock-hash
fi

node node_modules/typescript/bin/tsc --noEmit --watch --preserveWatchOutput &

pm2-runtime start pm2/process-local.json
