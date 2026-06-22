import { fetchRolePermissions } from '#services/roles-permissions/roles-permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Querystring: {
    role_id?: string;
    page: string;
    per_page: string;
  };
}

async function getRolePermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      role_id: roleIdRaw,
      page: pageRaw,
      per_page: perPageRaw,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const roleId = roleIdRaw ?? null;

  const fetchRolePermissionsParams = {
    roleId,
    page,
    perPage,
  };

  const result = await fetchRolePermissions(this.repositories.rolePermissions, fetchRolePermissionsParams);

  return reply
    .send(result)
  ;
}

export default getRolePermissions;
