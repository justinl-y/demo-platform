import { getUsers as getUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Querystring: {
    user_id?: string;
  };
}

async function getUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      user_id: userId = null,
    },
  } = request;

  const getUsersParams = {
    userId,
  };

  const result = await getUsersService(this.db, getUsersParams);

  return reply.send(result);
}

export default getUsers;
