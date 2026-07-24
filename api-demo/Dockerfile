# syntax=docker/dockerfile:1.7

# Build context is the repository root (see docker-compose / CI), so the root
# workspaces package.json + package-lock.json are available and `npm ci` can
# install the api-demo workspace from the single, unified lockfile.

# ── Base ─────────────────────────────────────────────────────────────────────
# Shared foundation for the builder and runtime-deps stages. Sets the workspace
# root as the working directory and installs a helper script that performs
# `npm ci`, optionally injecting an npm auth token from a BuildKit secret so
# private registry packages can be pulled without leaking the token into any
# image layer.
FROM node:26-alpine AS base

# Workspaces install root; the api-demo workspace lives at ${API_HOME}. npm
# hoists dependencies to ${WORKSPACE_ROOT}/node_modules, which Node resolves by
# walking up from ${API_HOME} at runtime.
ENV WORKSPACE_ROOT="/srv"
ENV API_HOME="/srv/api-demo"

WORKDIR ${WORKSPACE_ROOT}

# Write the npm-ci-with-token helper to a shared bin location so it can be
# reused by both the builder and runtime-deps stages. The script:
#   - reads an optional npm token from the BuildKit secret at /run/secrets/npm_token
#   - writes a temporary .npmrc (cleaned up on exit via trap) so the token is
#     never baked into an image layer
#   - forwards any extra arguments to `npm ci --legacy-peer-deps`
RUN cat <<'EOF' > /usr/local/bin/npm-ci-with-token
#!/bin/sh
set -eu

cleanup() {
	rm -f .npmrc
}

trap cleanup EXIT INT TERM

if test -f /run/secrets/npm_token; then
	NPM_TOKEN="$(cat /run/secrets/npm_token)"
	if test -n "${NPM_TOKEN}"; then
		printf '//registry.npmjs.org/:_authToken=%s\n' "${NPM_TOKEN}" > .npmrc
	fi
fi

npm ci --legacy-peer-deps "$@"
EOF

RUN chmod +x /usr/local/bin/npm-ci-with-token

# Copy the root manifests plus the api-demo workspace manifest early so the
# dependency install layer is cached independently from source changes. A scoped
# `npm ci --workspace=api-demo` only needs the root package.json + lockfile and
# the target workspace's package.json; sibling workspaces (app-demo, etc.) are
# deliberately omitted so their churn never busts this image's cache.
COPY package.json package-lock.json ${WORKSPACE_ROOT}/
COPY api-demo/package.json ${API_HOME}/package.json

# ── Builder ───────────────────────────────────────────────────────────────────
# Installs the api-demo workspace's dependencies (including devDependencies) and
# compiles TypeScript to dist/. Fails the build on type errors.
FROM base AS builder

# Install api-demo deps (dev included). Scoped to the workspace so sibling
# workspaces (app-demo, etc.) are not installed into the image. The npm cache is
# mounted so it persists across builds without being committed to the image.
RUN --mount=type=secret,id=npm_token --mount=type=cache,target=/root/.npm \
	npm-ci-with-token "--workspace=api-demo" "--include-workspace-root"

# Root tsconfig.base.json — api-demo/tsconfig.json extends ../tsconfig.base.json.
COPY tsconfig.base.json ${WORKSPACE_ROOT}/tsconfig.base.json
COPY api-demo/tsconfig.json ${API_HOME}/tsconfig.json
COPY api-demo/tsconfig.build.json ${API_HOME}/tsconfig.build.json
COPY api-demo/src ${API_HOME}/src
# Shared type declarations (#shared/* -> ../shared/*.d.ts). Type-only imports, so
# nothing is emitted to dist/, but the build's typecheck needs the .d.ts present.
COPY shared ${WORKSPACE_ROOT}/shared

# Compile TypeScript to dist/ and copy SQL files. Subpath imports (#utils, …)
# are resolved at runtime via the package.json "imports" map. Fails on type errors.
RUN npm run build --workspace=api-demo

# ── Runtime deps ──────────────────────────────────────────────────────────────
# Installs only production dependencies (--omit=dev) to keep the final image
# lean. Kept as a separate stage so the builder's devDependencies are not
# copied across.
FROM base AS runtime-deps

RUN --mount=type=secret,id=npm_token --mount=type=cache,target=/root/.npm \
	npm-ci-with-token "--workspace=api-demo" "--include-workspace-root" "--omit=dev"

# ── Runtime ───────────────────────────────────────────────────────────────────
# Final image. Assembles only the artefacts needed to run the API:
#   - production node_modules  (from runtime-deps, hoisted at ${WORKSPACE_ROOT})
#   - compiled JavaScript      (from builder)
#   - pm2 process config       (from build context)
FROM node:26-alpine AS runtime

ENV WORKSPACE_ROOT="/srv"
ENV API_HOME="/srv/api-demo"

WORKDIR ${API_HOME}

# Install pm2 globally for process management (cluster mode, restarts, logging).
RUN --mount=type=cache,target=/root/.npm npm i -g pm2@6.0.14

# Copy only what is needed at runtime — keeps the image free of dev tooling.
# The hoisted node_modules + root manifest, then the api-demo workspace (its
# package.json and any non-hoisted nested node_modules), then the compiled code.
COPY --from=runtime-deps ${WORKSPACE_ROOT}/node_modules ${WORKSPACE_ROOT}/node_modules
COPY --from=runtime-deps ${WORKSPACE_ROOT}/package.json ${WORKSPACE_ROOT}/package.json
COPY --from=runtime-deps ${API_HOME} ${API_HOME}
COPY --from=builder ${API_HOME}/dist ${API_HOME}/dist
COPY api-demo/pm2 ${API_HOME}/pm2

# Drop root privileges before the process starts.
RUN chown -R node:node ${WORKSPACE_ROOT}
USER node

EXPOSE 8000

CMD ["pm2-runtime", "start", "pm2/process.json"]
