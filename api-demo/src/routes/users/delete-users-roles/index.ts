import { deleteUserRoles as deleteUserRolesService } from '#services/users-roles/users-roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
}

async function deleteUsersRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
  } = request;

  const deleteUserRolesParams = {
    userId,
  };

  await deleteUserRolesService(this.repositories.usersRoles, this.repositories.users, deleteUserRolesParams);

  return reply
    .code(204)
    .send()
  ;
}

export default deleteUsersRoles;
