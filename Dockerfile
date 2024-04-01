FROM node:20.12.0

LABEL MAINTAINER Justin Levett-Yeats <jlevettyeats@semios.com>

ENV TERM xterm
ENV DEBIAN_FRONTEND noninteractive

# update index and install write/read data across TCP/UDP and python 3
RUN apt-get update -qy && apt-get install -qy \
  netcat-openbsd \
  python3-pip 

WORKDIR /var/www

RUN python3 -m pip --no-cache-dir install --break-system-packages --upgrade awscli

RUN npm i npm

# Install global node modules
RUN npm i -g pm2@5.3

# set the loglevel for npm to remove red wall.
ENV NPM_CONFIG_LOGLEVEL=warn

# create npm_token variable to hold the private npm repo auth token
# token will be used at npm install
# used only by Travis.
ARG NPM_TOKEN

RUN mkdir /var/log/api

WORKDIR /var/www

RUN rm -rf *

COPY . .

# if we attempt to run run.sh inside /var/www, it will error on permissions
# because Docker Compose uses maps volumes in real time.
COPY run.sh /run.sh

# EB env vars are only available at container run time.
# When deployed to EB, the test and source cmds will
# succeed due to 02-make-build-secrets.config .ebextension.
# The NPM_TOKEN should otherwise be defined for local and CI builds.
RUN /bin/bash -c "test -f .build.npm-token.env && source .build.npm-token.env; npm i --production;"

# give'r
RUN chmod +x /run.sh
CMD ["/run.sh"]

EXPOSE 8000
