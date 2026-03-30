#!/bin/bash

set -euo pipefail

if [ "$#" -lt 3 ]; then
  >&2 echo "Usage: $0 <api_host> <api_port> <command> [args...]"
  exit 1
fi

api_host=$1
api_port=$2
shift 2

if [ "$#" -eq 0 ]; then
  >&2 echo "No command provided to execute after API wait"
  exit 1
fi

# wait for the api docker to be running
until nc -z "$api_host" "$api_port";
do
  >&2 echo "API Building - Sleeping until awake..."
  sleep 1
done

>&2 echo "API Available - Moving onto rebuilding and seeding the DB..."

# run the command
exec "$@"
