FROM postgis/postgis:18-3.6

# The official Postgres Docker image will run .sql
# scripts found in the /docker-entrypoint-initdb.d/ folder.
WORKDIR /docker-entrypoint-initdb.d

# .sql will also be auto-run!
COPY schema/* ./

WORKDIR /
