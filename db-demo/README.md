# db-demo

The database tier of the demo platform. Holds the PostgreSQL/PostGIS schema for the
demo database as ordered init scripts.

## Structure

```text
schema/   # SQL init scripts, applied in filename order
```

Files in `schema/` are mounted into the PostGIS container's
`/docker-entrypoint-initdb.d/` and executed in lexical order on first start, so the
numeric filename prefix controls ordering (e.g. `0000000000-init.sql` runs first).

This schema seeds the test/CI database stood up by `api-demo`'s
`docker-compose-ci.yml` (the `db` service bind-mounts `../db-demo/schema`), which the
API integration tests and `pgtyped` type generation both run against.
