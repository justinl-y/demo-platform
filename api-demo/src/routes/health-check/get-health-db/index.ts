import { checkDb } from '#services/health/health.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

async function getHealthDB(this: FastifyInstance, _request: FastifyRequest, reply: FastifyReply) {
  const result = await checkDb(this.db);

  return reply.send(result);
}

export default getHealthDB;
