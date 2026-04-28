import { checkEb } from '#services/health/health.service';

import type { FastifyRequest, FastifyReply } from 'fastify';

function getHealthEB(request: FastifyRequest, reply: FastifyReply) {
  reply.send(checkEb());
}

export default getHealthEB;
