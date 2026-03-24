FROM node:25-alpine

RUN apk add --no-cache \
  bash \
  netcat-openbsd \
  postgresql18-contrib

WORKDIR /usr

COPY package*.json .

RUN npm ci --omit=dev

# set path to local node_modules
ENV PATH=/usr/node_modules/.bin:$PATH

WORKDIR /usr/app

RUN rm -rf *

COPY . .

# Ensure host-built modules are not baked into the image; runtime deps come from Linux-native install at /usr/node_modules.
RUN rm -rf /usr/app/node_modules

COPY wait-api-container.sh /wait-api-container.sh
COPY run.sh /run.sh

RUN chmod +x /wait-api-container.sh
RUN chmod +x /run.sh

# Expose
EXPOSE 80
