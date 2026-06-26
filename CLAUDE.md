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

## Workspaces

This repo is an [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) monorepo. Run `npm install` **once at the root** to install every package against a single root `package-lock.json` — there is no per-package install. Shared tooling (`eslint`, `neostandard`, `jiti`, `lint-staged`, `typescript`, `@types/node`) lives in the root `devDependencies`; package-specific deps stay in each package. Run a package's scripts from its directory, or from the root with `-w <package>` (e.g. `npm run build -w api-demo`). Root fan-out scripts (`npm run build` / `typecheck` / `lint`) run across all workspaces.

The root `dependencies` lists `ajv` purely to control hoisting: it forces a single `ajv@8` into the top-level `node_modules` so api-demo's runtime validation stack (`fastify`, `ajv-formats`, `ajv-keywords`) all share one module instance. Without it, `eslint`'s transitive `ajv@6` claims the top slot and `ajv@8` gets duplicated, which corrupts `ajv-keywords`' generated validators at runtime. `eslint` keeps its own nested `ajv@6`.

## Packages

- **app-demo** — front-end SPA (React + TypeScript + Vite); see `app-demo/README.md` for stack, commands, and deployment
- **api-demo** — see `api-demo/CLAUDE.md` for commands, environments, conventions, and architecture
- **db-demo** — PostgreSQL schema/init scripts seeding the API's database; see `db-demo/CLAUDE.md`
- **shared** — shared TypeScript resources consumed across packages
