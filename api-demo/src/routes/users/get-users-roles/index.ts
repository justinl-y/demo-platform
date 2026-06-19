import { fetchUsersRoles } from '#services/users-roles/users-roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Querystring: {
    user_id?: string;
    page: string;
    per_page: string;
  };
}

async function getUsersRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      user_id: userIdRaw,
      page: pageRaw,
      per_page: perPageRaw,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const userId = userIdRaw ?? null;

  const fetchUsersRolesParams = {
    userId,
    page,
    perPage,
  };

  const result = await fetchUsersRoles(this.repositories.usersRoles, fetchUsersRolesParams);

  return reply
    .send(result)
  ;
}

export default getUsersRoles;
