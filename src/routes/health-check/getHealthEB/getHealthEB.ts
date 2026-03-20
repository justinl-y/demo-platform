import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

function getHealthEB(req: FastifyRequest, rep: FastifyReply) {
  const healthEB = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };

  rep.send(healthEB);

  return rep;
}

export default getHealthEB;
