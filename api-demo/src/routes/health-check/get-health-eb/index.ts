import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

function getHealthEB(request: FastifyRequest, reply: FastifyReply) {
  const healthEB = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };

  reply.send(healthEB);

  return reply;
}

export default getHealthEB;
