import { checkEb } from '#services/health/health.service';

import type { FastifyRequest, FastifyReply } from 'fastify';

function getHealthEB(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(checkEb());
}

export default getHealthEB;
