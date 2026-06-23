# db-demo

The database tier of the demo platform — the PostgreSQL/PostGIS schema for the demo
database, as ordered SQL init scripts. No build, no runtime; just schema.

## Structure

```text
schema/   # SQL init scripts, applied in filename order
```

## Conventions

- **Ordering**: Scripts run in lexical filename order. Each file is prefixed with a
  numeric key that controls when it runs — `0000000000-init.sql` first,
  `9999999999-db-roles-permissions.sql` last. New scripts pick a prefix that places
  them at the right point in the sequence.
- **Naming**: `<numeric-prefix>-<kebab-description>.sql`.
- **One concern per file**: Each script covers a single logical change (a table set,
  an auth schema, an index batch), mirroring the migration-style history.

## How it's consumed

The scripts are mounted into a PostGIS container's `/docker-entrypoint-initdb.d/`,
which executes them on first start. The only consumer today is `api-demo`'s
`docker-compose-ci.yml` (the `db` service bind-mounts `../db-demo/schema`), standing up
the database that the API integration tests and `pgtyped` type generation run against.

> Production/staging databases are provisioned separately (AWS RDS); this package is the
> source of truth for the schema, not a live deployment.
