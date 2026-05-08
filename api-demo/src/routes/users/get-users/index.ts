import { getUsers as getUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { UserStatus } from '../../../types/general.ts';

interface Request {
  Querystring: {
    page: string;
    per_page: string;
    status?: UserStatus | UserStatus[];
    user_id?: string;
  };
}

async function getUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      page: pageRaw,
      per_page: perPageRaw,
      status: statusRaw = null,
      user_id: userId = null,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const status = statusRaw ? (Array.isArray(statusRaw) ? statusRaw : [statusRaw]) : null;

  const getUsersParams = {
    page,
    perPage,
    status,
    userId,
  };

  const result = await getUsersService(this.repositories.users, getUsersParams);

  return reply.send(result);
}

export default getUsers;
