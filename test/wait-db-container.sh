#!/bin/bash

postgres_host=$1
postgres_port=$2
shift 2

cmd="$@"

# wait for the postgres docker to be running
until nc -z $postgres_host $postgres_port;
do
  >&2 echo "DB Building - Sleeping until awake..."
  sleep 1
done

>&2 echo "DB Available - Moving onto building the API..."

# run the command
exec $cmd
