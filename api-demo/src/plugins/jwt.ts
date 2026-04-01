import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type {
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  authConfig,
} from '#config/auth';
import {
  userConfig,
} from '#config/api';

function jwtPlugin(fastify: FastifyInstance, options: FastifyPluginOptions): void {
  const jwtAuthConfig = authConfig();

  const jwtOptions = {
    secret: jwtAuthConfig.secret,
    sign: {
      aud: jwtAuthConfig.audience,
      expiresIn: userConfig.password.expirationTime,
    },
  };

  fastify.register(fastifyJwt, jwtOptions);
}

export default fp(jwtPlugin);
