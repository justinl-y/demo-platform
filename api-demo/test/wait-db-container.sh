#!/bin/bash

set -euo pipefail

if [ "$#" -lt 3 ]; then
  >&2 echo "Usage: $0 <db_host> <db_port> <command> [args...]"
  exit 1
fi

postgres_host=$1
postgres_port=$2
shift 2

if [ "$#" -eq 0 ]; then
  >&2 echo "No command provided to execute after DB wait"
  exit 1
fi

# wait for the postgres docker to be running
until nc -z "$postgres_host" "$postgres_port";
do
  >&2 echo "DB Building - Sleeping until awake..."
  sleep 1
done

>&2 echo "DB Available - Moving onto building the API..."

# run the command
exec "$@"
