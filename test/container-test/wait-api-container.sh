#!/bin/bash

api_host=$1
api_port=$2
shift 2
cmd="$@"

# wait for the api docker to be running
until nc -z $api_host $api_port;
do
  >&2 echo "API Building - Sleeping until awake..."
  sleep 1
done

>&2 echo "API Available - Moving onto rebuilding and seeding the DB..."

# run the command
exec $cmd
