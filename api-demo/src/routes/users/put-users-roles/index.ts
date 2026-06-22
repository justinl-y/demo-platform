import { editUserRoles } from '#services/users-roles/users-roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
  Body: {
    roles: string[];
  };
}

async function putUsersRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
    body: {
      roles,
    },
  } = request;

  const editUserRolesParams = {
    userId,
    roleIds: roles,
  };

  const result = await editUserRoles(this.repositories.usersRoles, this.repositories.users, this.repositories.roles, editUserRolesParams);

  return reply
    .send(result)
  ;
}

export default putUsersRoles;
