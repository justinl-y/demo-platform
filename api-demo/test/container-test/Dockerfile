# syntax=docker/dockerfile:1.7
FROM node:26-alpine

RUN apk add --no-cache \
  bash \
  curl \
  netcat-openbsd \
  postgresql18-contrib

WORKDIR /usr

COPY package*.json .

# --legacy-peer-deps: this project has no explicit `typescript` devDependency, so a strict `npm ci`
# fails once the registry serves a newer TypeScript satisfying @typescript-eslint's peer range than
# existed when the lockfile was cut (matches every other install in the repo).
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev --legacy-peer-deps

# set path to local node_modules
ENV PATH=/usr/node_modules/.bin:$PATH

WORKDIR /usr/app

COPY . .

# Ensure host-built modules are not baked into the image; runtime deps come from Linux-native install at /usr/node_modules.
RUN rm -rf /usr/app/node_modules

COPY --chmod=755 wait-api-container.sh /wait-api-container.sh
COPY --chmod=755 run.sh /run.sh
