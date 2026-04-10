# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS base
<<<<<<< HEAD
=======

RUN apk add --no-cache bash
>>>>>>> db6cec39badcbd71ed1f409e58420118a8ab6baa

ENV API_HOME="/srv/api"

WORKDIR ${API_HOME}

# Reuse a single install path for both builder and runtime dependency stages.
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

COPY package*.json ${API_HOME}/

FROM base AS builder

RUN --mount=type=secret,id=npm_token --mount=type=cache,target=/root/.npm npm-ci-with-token

COPY tsconfig.json ${API_HOME}/
COPY src ${API_HOME}/src

# check for ts errors as using node native ts support
RUN npm run typecheck

FROM base AS runtime-deps

RUN --mount=type=secret,id=npm_token --mount=type=cache,target=/root/.npm npm-ci-with-token "--omit=dev"

FROM node:24-alpine AS runtime

ENV API_HOME="/srv/api"

WORKDIR ${API_HOME}

RUN --mount=type=cache,target=/root/.npm npm i -g pm2@6.0.14

COPY --from=runtime-deps ${API_HOME}/package*.json ${API_HOME}/
COPY --from=runtime-deps ${API_HOME}/node_modules ${API_HOME}/node_modules
COPY --from=builder ${API_HOME}/src ${API_HOME}/src
COPY pm2 ${API_HOME}/pm2

RUN chown -R node:node ${API_HOME}
USER node

EXPOSE 8000

CMD ["pm2-runtime", "start", "pm2/process.json"]
