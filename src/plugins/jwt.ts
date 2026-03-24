import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import type {
  FastifyInstance,
  FastifyPluginOptions,
} from 'fastify';

import {
  auth,
  user,
} from '../config/index.ts';

function jwtPlugin(fastify: FastifyInstance, options: FastifyPluginOptions): void {
  const jwtOptions = {
    secret: auth.secret,
    sign: {
      aud: auth.audience,
      expiresIn: user.password.expirationTime,
    },
  };

  fastify.register(fastifyJwt, jwtOptions);
}

export default fp(jwtPlugin);
