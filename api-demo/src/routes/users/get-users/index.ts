import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

function getUsers(request: FastifyRequest, reply: FastifyReply) {
  const defaultResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };

  reply.send(defaultResponse);
}

export default getUsers;
