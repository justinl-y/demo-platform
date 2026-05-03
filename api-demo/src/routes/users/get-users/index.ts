import { getUsers as getUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  query: {
    user_id: string | null;
  };
}

async function getUsers(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    query: {
      user_id: userId = null,
    },
  } = request as Request;

  const result = await getUsersService(this.db, userId);

  return reply.send(result);
}

export default getUsers;
