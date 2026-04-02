import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type {
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  Config,
} from '#config/index';

function jwtPlugin(fastify: FastifyInstance, options: FastifyPluginOptions): void {
  const jwtAuthConfig = Config.authConfig();

  const jwtOptions = {
    secret: jwtAuthConfig.secret,
    sign: {
      aud: jwtAuthConfig.audience,
      expiresIn: Config.userConfig.password.expirationTime,
    },
  };

  fastify.register(fastifyJwt, jwtOptions);
}

export default fp(jwtPlugin);
