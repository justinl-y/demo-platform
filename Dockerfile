# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS builder

RUN apk add --no-cache bash

ENV API_HOME="/srv/api"

WORKDIR ${API_HOME}

COPY package*.json ${API_HOME}/
COPY tsconfig.json ${API_HOME}/

# Use deterministic installs and mount npm token as a BuildKit secret when present.
RUN --mount=type=secret,id=npm_token /bin/bash -c "if test -f /run/secrets/npm_token; then NPM_TOKEN=$(cat /run/secrets/npm_token); if test -n \"${NPM_TOKEN}\"; then printf '//registry.npmjs.org/:_authToken=%s\n' \"${NPM_TOKEN}\" > .npmrc; fi; fi; npm ci;"

COPY src ${API_HOME}/src

# check for ts errors as using node 24 native ts support
RUN npm run typecheck

RUN npm prune --omit=dev
RUN rm -f .npmrc

FROM node:24-alpine AS runtime

ENV API_HOME="/srv/api"

WORKDIR ${API_HOME}

RUN npm i -g pm2@6.0.14

COPY --from=builder ${API_HOME}/package*.json ${API_HOME}/
COPY --from=builder ${API_HOME}/node_modules ${API_HOME}/node_modules
COPY --from=builder ${API_HOME}/src ${API_HOME}/src
COPY pm2 ${API_HOME}/pm2

EXPOSE 8000

CMD ["pm2-runtime", "start", "pm2/process.json"]
