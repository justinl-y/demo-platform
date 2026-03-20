FROM postgis/postgis:17-3.5

# The official Postgres Docker image will run .sql
# scripts found in the /docker-entrypoint-initdb.d/ folder.
WORKDIR /docker-entrypoint-initdb.d

# .sql will also be auto-run!
COPY schema/* ./

WORKDIR /
