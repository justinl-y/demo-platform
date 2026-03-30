import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

function getHealthDB(req: FastifyRequest, rep: FastifyReply) {
  const healthDB = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };

  rep.send(healthDB);

  return rep;
}

export default getHealthDB;
