# api-demo

A RESTful web API serving as the primary data service for the demo platform. Built with Node.js, TypeScript, Fastify, and PostgreSQL.

## Commands

All commands run from `api-demo/`:

| Command | Purpose |
|---|---|
| `npm run api-down` | Tear down local Docker environment |
| `npm run api-build` | Build local Docker images |
| `npm run api-up-sso` | SSO login + start local API (localhost:6662) |
| `npm run ci-down` | Tear down CI Docker environment |
| `npm run ci-build` | Build CI Docker images (api + test in parallel) |
| `npm run ci-up api` | Start DB + API containers for testing (localhost:6663) |
| `npm run ci-up test` | Seed DB and run integration tests |
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

## Tech Stack

- **Runtime**: Node.js >=24.8.0, npm >=11.6.0
- **Framework**: Fastify 5 with plugins (JWT, CORS, Helmet, Swagger, compression)
- **Database**: PostgreSQL via `pg` (node-postgres)
- **Type-safe SQL**: pgtyped — SQL files in `routes/**/types/*.typed.sql`, generates `.queries.ts`
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
  routes/               # Route handlers, grouped by resource
    auth/               # post-login, post-refresh, put-invite, put-logout, put-reset-password
    users/              # get-users
    health-check/
  hooks/                # Fastify lifecycle hooks (auth, error handling, Sentry)
  utils/                # Shared utilities
  types/                # Shared TypeScript types
```

## Conventions

**Route files**: Each route lives in its own directory under `src/routes/<resource>/<action>/` containing:

- `index.ts` — route handler
- `schema.ts` — JSON schema for request/response
- `types/*.typed.sql` — pgtyped SQL files (generates `*.queries.ts`)

**Typed SQL**: SQL query files use pgtyped. After editing `.typed.sql` files, regenerate types with `npm run sql:types`.

**Path aliases**: Use `#utils/*` and `#config/*` instead of relative imports for utils and config.

**Named functions required for route handlers**: Arrow functions lose the Fastify `this` context. Use named `async function` declarations for handlers. Pass `this` to helper functions with `.call(this, args)`.

**Database access**: Via `this.db.query(sqlFile, params, outputFormat?)` and `this.db.transaction(fnParamGroup)` — both decorated on the Fastify instance by the postgres plugin. Do not import a db module directly.

**TypeScript**: Strict mode (`noImplicitAny`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Uses Node 24 tsconfig base. No `tsc` emit — source runs directly via Node's native TS support.
