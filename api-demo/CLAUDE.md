# api-demo

A RESTful web API serving as the primary data service for the demo platform. Built with Node.js, TypeScript, Fastify, and PostgreSQL.

## Commands

All commands run from `api-demo/`:

| Command | Purpose |
| --- | --- |
| `npm run api-down` | Tear down local Docker environment |
| `npm run api-build` | Build local Docker images |
| `npm run api-up-sso` | SSO login + start local API (localhost:6662) |
| `npm run ci-down` | Tear down CI Docker environment |
| `npm run ci-build` | Build CI Docker images (api + test in parallel) |
| `npm run ci-up api` | Start DB + API containers for testing (localhost:6663) |
| `npm run ci-up test` | Seed DB and run integration tests |
| `npm run ci-up -- test -c` | Seed DB, run integration tests, and print V8 coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint-fix` | Auto-fix lint issues |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run sql:types` | Generate typed SQL queries via pgtyped |

## Environments

### Local (remote services)

- Requires AWS SSO credentials (`api-demo-stage` profile)
- Connects to staging RDS PostgreSQL (IP whitelist required)
- `aws configure sso --profile api-demo-stage` for one-time setup
- Start: `npm run api-down && npm run api-build && npm run api-up-sso`

### Test/CI (local DB)

- Three containers: DB (PostGIS), API, TEST
- Terminal 1: `npm run ci-down && npm run ci-build && npm run ci-up api`
- Terminal 2: `npm run ci-up test`
- Run a specific test file: `TEST_CASE=<integer-prefix> npm run ci-up test`
- Run with V8 coverage report: `npm run ci-up -- test -c` (or `COVERAGE=1 npm run ci-up test`)

## Tech Stack

- **Runtime**: Node.js >=24.8.0, npm >=11.6.0
- **Framework**: Fastify 5 with plugins (JWT, CORS, Helmet, Swagger, compression)
- **Database**: PostgreSQL via `pg` (node-postgres)
- **Type-safe SQL**: pgtyped — SQL files in `repositories/**/types/*.typed.sql`, generates `.queries.ts`
- **Observability**: Sentry (errors + tracing + profiling)
- **Auth**: JWT via `@fastify/jwt`, bcrypt for password hashing, AWS Secrets Manager for secrets
- **Linting**: ESLint with neostandard config; lint-staged runs on commit

## Project Structure (`src/`)

```text
src/
  index.ts              # Entrypoint
  build-instance.ts     # Fastify instance builder
  config/               # Config modules (api, auth, aws, fastify, postgres, sentry, swagger)
  plugins/              # Fastify plugins (postgres, jwt, custom-ajv-formats)
  hooks/                # Fastify lifecycle hooks (auth, error handling, Sentry)
  routes/               # Thin HTTP handlers — parse request, call service, send response
    auth/               # post-login, post-refresh
    users/              # get-users
    health-check/       # get-health-db, get-health-eb
  services/             # Business logic — no HTTP, no SQL
    auth/               # login(), refresh()
    health/             # checkDb(), checkEb()
    users/              # getUsers()
  repositories/         # DB access only — SQL files, pgtyped types, query functions
    auth/               # getUserByEmail, getUserWithRefreshToken, setUserTokenOnLogin, setUserTokenOnRefresh
    health/             # getPgVersion
    users/              # getUsers
  lib/                  # Framework-level utilities (database, authentication, logger, sentry)
  utils/                # Shared pure utilities and constants
  types/                # Shared TypeScript types
  decorators/           # Sentry span decorators
```

## Conventions

### Architecture — three layers

Each feature spans three layers. Keep logic in its correct layer:

| Layer | Location | Owns |
| --- | --- | --- |
| Route handler | `src/routes/<resource>/<action>/index.ts` | HTTP: parse request, call service, set cookies, send response |
| Service | `src/services/<resource>/<resource>.service.ts` | Business logic: validation, orchestration, error decisions |
| Repository | `src/repositories/<resource>/<resource>.repository.ts` | DB access only: SQL files, pgtyped types, `db.query` / `db.transaction` calls |

**Route files**: Each route directory contains:

- `index.ts` — thin handler, no business logic or SQL
- `schema.ts` — JSON schema for request/response validation

**Service functions**: Plain `async function` — no Fastify dependency. Receive `db: DatabaseDecorator` and (where needed) `jwt: JWT` as parameters passed in from the handler via `this.db` and `this.jwt`.

**Repository files**: Each repository directory contains:

- `<resource>.repository.ts` — exported functions taking `db: DatabaseDecorator` as first parameter
- `<name>.sql` — SQL source files (single statement each)
- `types/<name>.typed.sql` — pgtyped input files (auto-generated from `.sql` by `npm run sql:types`)
- `types/<name>.typed.queries.ts` — pgtyped output (generated — do not edit)

**Typed SQL**: Run `npm run sql:types` after adding or editing any `.sql` file in `repositories/`. This generates the `.typed.sql` and `.typed.queries.ts` files.

**Path aliases**: Use `#utils/*`, `#config/*`, `#lib/*`, `#decorators/*`, `#services/*`, `#repositories/*` instead of relative imports.

**Named functions required for route handlers**: Arrow functions lose the Fastify `this` context. Use named `async function` declarations. Services and repositories do not use `this` — they receive dependencies as plain function parameters.

**Database access**: `this.db` is available on the Fastify instance (decorated by the postgres plugin). Handlers pass `this.db` to service functions; services pass it to repository functions. Do not call `this.db` directly from services or import the database module directly.

**TypeScript**: Strict mode (`noImplicitAny`, `verbatimModuleSyntax`). Stage 3 (TC39) decorators are supported natively — no tsconfig flag required; do not use `experimentalDecorators`. Uses Node 24 tsconfig base. Local/CI: source runs directly via tsx (hot reload via pm2 watch). Production: compiled to `dist/` via `npm run build` (`tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`). Type errors reported in local/CI by `tsc --noEmit --watch` running alongside the server.
