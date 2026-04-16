import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type {
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  Config,
} from '#config/index';

function jwtPlugin(fastify: FastifyInstance, _options: FastifyPluginOptions): void {
  const jwtAuthConfig = Config.authConfig();

  fastify.register(fastifyJwt, {
    secret: jwtAuthConfig.secret,
    cookie: {
      cookieName: jwtAuthConfig.accessTokenCookie,
      signed: false,  // no need, jwt is signed
    },
  });
}

export default fp(jwtPlugin);
