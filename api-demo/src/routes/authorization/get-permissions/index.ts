import { fetchPermissions } from '#services/permissions/permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Querystring: {
    page: string;
    per_page: string;
    permission_id?: string;
  };
}

async function getPermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      page: pageRaw,
      per_page: perPageRaw,
      permission_id: permissionIdRaw,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const permissionId = permissionIdRaw ?? null;

  const fetchPermissionsParams = {
    page,
    perPage,
    permissionId,
  };

  const result = await fetchPermissions(this.repositories.permissions, fetchPermissionsParams);

  return reply
    .send(result)
  ;
}

export default getPermissions;
