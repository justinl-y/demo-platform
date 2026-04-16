# syntax=docker/dockerfile:1.7

# ── Base ─────────────────────────────────────────────────────────────────────
# Shared foundation for the builder and runtime-deps stages. Sets the working
# directory and installs a helper script that performs `npm ci`, optionally
# injecting an npm auth token from a BuildKit secret so private registry
# packages can be pulled without leaking the token into any image layer.
FROM node:24-alpine AS base

ENV API_HOME="/srv/api"

WORKDIR ${API_HOME}

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

# Copy manifests early so that dependency install layers are cached
# independently from source changes.
COPY package*.json ${API_HOME}/

# ── Builder ───────────────────────────────────────────────────────────────────
# Installs all dependencies (including devDependencies) and compiles TypeScript
# to dist/ via tsc + tsc-alias. Fails the build on type errors.
FROM base AS builder

# Install all deps (dev included). The npm cache is mounted so it persists
# across builds without being committed to the image.
RUN --mount=type=secret,id=npm_token --mount=type=cache,target=/root/.npm npm-ci-with-token

COPY tsconfig.json ${API_HOME}/
COPY tsconfig.build.json ${API_HOME}/
COPY src ${API_HOME}/src

# Compile TypeScript to dist/ and rewrite path aliases to relative imports.
# Fails the build on type errors.
RUN npm run build

# ── Runtime deps ──────────────────────────────────────────────────────────────
# Installs only production dependencies (--omit=dev) to keep the final image
# lean. Kept as a separate stage so the builder's devDependencies are not
# copied across.
FROM base AS runtime-deps

RUN --mount=type=secret,id=npm_token --mount=type=cache,target=/root/.npm npm-ci-with-token "--omit=dev"

# ── Runtime ───────────────────────────────────────────────────────────────────
# Final image. Assembles only the artefacts needed to run the API:
#   - production node_modules  (from runtime-deps)
#   - compiled JavaScript      (from builder)
#   - pm2 process config       (from build context)
FROM node:24-alpine AS runtime

ENV API_HOME="/srv/api"

WORKDIR ${API_HOME}

# Install pm2 globally for process management (cluster mode, restarts, logging).
RUN --mount=type=cache,target=/root/.npm npm i -g pm2@6.0.14

# Copy only what is needed at runtime — keeps the image free of dev tooling.
COPY --from=runtime-deps ${API_HOME}/package*.json ${API_HOME}/
COPY --from=runtime-deps ${API_HOME}/node_modules ${API_HOME}/node_modules
COPY --from=builder ${API_HOME}/dist ${API_HOME}/dist
COPY pm2 ${API_HOME}/pm2

# Drop root privileges before the process starts.
RUN chown -R node:node ${API_HOME}
USER node

EXPOSE 8000

CMD ["pm2-runtime", "start", "pm2/process.json"]
