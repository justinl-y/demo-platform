import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

function cookiePlugin(fastify: FastifyInstance, _options: FastifyPluginOptions): void {
  fastify.register(cookie);
}

export default fp(cookiePlugin);
