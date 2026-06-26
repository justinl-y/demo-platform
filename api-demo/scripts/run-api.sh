#!/bin/sh
set -eu

/srv/node_modules/.bin/tsc --noEmit --watch --preserveWatchOutput &

exec pm2-runtime start pm2/process-local.json
