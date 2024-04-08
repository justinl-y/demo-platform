#!/bin/bash

echo 'Beginning server startup...'

# causes the script to exit completely if
# any command below fails with status code > 0
# http://stackoverflow.com/a/821419/568884
set -e

# set .env S3 path
if [ -z "$DOTENV_FILE_S3_PATH" ]; then
  if [ "$NODE_ENV" = "local" ]; then
    DOTENV_FILE_S3_PATH="stage"
  else
    DOTENV_FILE_S3_PATH=$NODE_ENV
  fi
fi

# fetch .env from S3
echo 'Fetching .env from S3 for:' $DOTENV_FILE_S3_PATH
aws s3 cp s3://5950-8058-1694/api-env-keys/$DOTENV_FILE_S3_PATH/.env .env --quiet

# update PM2
PM2_SILENT=true pm2 update

# set pm2 config file
$PM2_FILE

if [ "$NODE_ENV" = "local" ] || [ "$NODE_ENV" = "test" ]; then
  # pm2 will perform in-memory ts transpilation (see docker file)

  PM2_FILE="process-local.json"
elif [ "$NODE_ENV" = "stage" ] || [ "$NODE_ENV" = "prod" ]; then
  # perform explicit ts transpile
  npm run build

  PM2_FILE="process.json"
fi

# start PM2
# pm2-runtime npm -- run build --no-autorestart 
pm2-runtime start pm2/$PM2_FILE
echo 'PM2 Started, version: v'$(pm2-runtime --version)
