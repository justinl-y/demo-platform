import { fetchPermissions } from '#services/permissions/permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { SortOrder } from '../../../types/general.ts';

interface Request {
  Querystring: {
    order: SortOrder;
    page: string;
    per_page: string;
    search?: string;
    // Always present at runtime: the schema validates the enum and supplies the default.
    sort: string;
  };
}

async function getPermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      order,
      page: pageRaw,
      per_page: perPageRaw,
      search: searchRaw,
      sort,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const search = searchRaw ?? null;

  const fetchPermissionsParams = {
    page,
    perPage,
    search,
    sort,
    order,
  };

  const result = await fetchPermissions(this.repositories.permissions, fetchPermissionsParams);

  return reply
    .send(result)
  ;
}

export default getPermissions;
