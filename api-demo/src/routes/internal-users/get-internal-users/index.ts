import { fetchInternalUsers } from '#services/internal-users/internal-users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import type { UserStatus, SortOrder } from '../../../types/general.ts';

interface Request {
  Querystring: {
    order: SortOrder;
    page: string;
    per_page: string;
    status?: UserStatus | UserStatus[];
    search?: string;
    sort: string;
  };
}

async function getInternalUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    query: {
      order,
      page: pageRaw,
      per_page: perPageRaw,
      status: statusRaw,
      search: searchRaw,
      sort,
    },
  } = request;

  const page = +pageRaw;
  const perPage = +perPageRaw;
  const status = statusRaw ? (Array.isArray(statusRaw) ? statusRaw : [statusRaw]) : null;
  const search = searchRaw ?? null;

  const fetchInternalUsersParams = {
    page,
    perPage,
    search,
    status,
    sort,
    order,
  };

  const result = await fetchInternalUsers(this.repositories.internalUsers, fetchInternalUsersParams);

  return reply
    .send(result)
  ;
}

export default getInternalUsers;
