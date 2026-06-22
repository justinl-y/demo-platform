import { fetchRoles } from '#services/roles/roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Querystring: {
    page: string;
    per_page: string;
    role_id?: string;
  };
}

async function getRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      page: pageRaw,
      per_page: perPageRaw,
      role_id: roleIdRaw,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const roleId = roleIdRaw ?? null;

  const fetchRolesParams = {
    page,
    perPage,
    roleId,
  };

  const result = await fetchRoles(this.repositories.roles, fetchRolesParams);

  return reply
    .send(result)
  ;
}

export default getRoles;
