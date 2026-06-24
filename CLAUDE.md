# Demo Platform

A monorepo demonstrating a distributed full-stack web application using type-safe TypeScript.

## Structure

```text
/app-demo   # App tier — Front-end SPA (React + TypeScript + Vite)
/api-demo   # API tier — Backend REST API (Node.js + Fastify + PostgreSQL DQL/DML)
/db-demo    # DB tier — PostgreSQL schema (DDL) and init scripts
/shared     # Shared TypeScript resources
```

> The front-end (`/app-demo`) currently presents a staging landing page on the React + Vite stack; the full application UI is in progress.

## Packages

- **app-demo** — front-end SPA (React + TypeScript + Vite); see `app-demo/README.md` for stack, commands, and deployment
- **api-demo** — see `api-demo/CLAUDE.md` for commands, environments, conventions, and architecture
- **db-demo** — PostgreSQL schema/init scripts seeding the API's database; see `db-demo/CLAUDE.md`
- **shared** — shared TypeScript resources consumed across packages
