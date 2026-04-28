import { checkDb } from '#services/health/health.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

async function getHealthDB(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const result = await checkDb(this.db);

  reply.status(200).send(result);
}

export default getHealthDB;
