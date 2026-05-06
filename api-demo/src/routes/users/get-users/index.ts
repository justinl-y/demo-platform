import { getUsers as getUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Querystring: {
    inactive: 'include' | 'exclude' | 'only';
    page: string;
    per_page: string;
    user_id?: string;
  };
}

async function getUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      inactive,
      page: pageRaw,
      per_page: perPageRaw,
      user_id: userId = null,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;

  const getUsersParams = {
    inactive,
    page,
    perPage,
    userId,
  };

  const result = await getUsersService(this.repositories.users, getUsersParams);

  return reply.send(result);
}

export default getUsers;
