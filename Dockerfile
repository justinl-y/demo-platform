FROM node:24-alpine

RUN apk update \
  && apk add bash

ENV API_HOME="/srv/api"

ARG NPM_TOKEN

WORKDIR ${API_HOME}

RUN npm i pm2@6.0.14 -g

COPY package*.json ${API_HOME}/
COPY tsconfig.json ${API_HOME}/
COPY .swcrc ${API_HOME}/
COPY src ${API_HOME}/src

RUN /bin/bash -c "test -f .build.npm-token.env && source .build.npm-token.env; npm i;" 
RUN npm run build
RUN npm prune --omit=dev

COPY .ebextensions ${API_HOME}/.ebextensions
COPY .platform ${API_HOME}/.platform
COPY proxy ${API_HOME}/proxy
COPY pm2 ${API_HOME}/pm2

RUN rm -f .npmrc

EXPOSE 8000

CMD ["pm2-runtime", "start", "pm2/process.json"]
