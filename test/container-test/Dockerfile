# syntax=docker/dockerfile:1.7
FROM node:25-alpine

RUN apk add --no-cache \
  bash \
  netcat-openbsd \
  postgresql18-contrib

WORKDIR /usr

COPY package*.json .

RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

# set path to local node_modules
ENV PATH=/usr/node_modules/.bin:$PATH

WORKDIR /usr/app

COPY . .

# Ensure host-built modules are not baked into the image; runtime deps come from Linux-native install at /usr/node_modules.
RUN rm -rf /usr/app/node_modules

COPY --chmod=755 wait-api-container.sh /wait-api-container.sh
COPY --chmod=755 run.sh /run.sh
