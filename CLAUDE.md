# Demo Platform

A monorepo demonstrating a distributed full-stack web application using type-safe TypeScript.

## Structure

```text
/api-demo   # API tier — Backend REST API (Node.js + Fastify + PostgreSQL DQL/DML)
/db-demo    # DB tier — PostgreSQL schema (DDL) and init scripts
/shared     # Shared TypeScript resources
```

> Frontend (`/app-demo`) currently exists as a static prototype; the planned modern stack is not yet implemented.

## Packages

- **api-demo** — see `api-demo/CLAUDE.md` for commands, environments, conventions, and architecture
- **db-demo** — PostgreSQL schema/init scripts seeding the API's database; see `db-demo/CLAUDE.md`
- **shared** — shared TypeScript resources consumed across packages
