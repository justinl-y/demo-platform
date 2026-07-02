import { assignUserRoles } from '#services/users-roles/users-roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
  Body: {
    roles: string[];
  };
}

async function postInternalUsersRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
    body: {
      roles,
    },
  } = request;

  const assignUserRolesParams = {
    userId,
    roleIds: roles,
  };

  const result = await assignUserRoles(this.repositories.usersRoles, this.repositories.internalUsers, this.repositories.roles, assignUserRolesParams);

  return reply
    .code(201)
    .send(result);
}

export default postInternalUsersRoles;
