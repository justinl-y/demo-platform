import { deleteRole } from '#services/roles/roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    role_id: string;
  };
}

async function deleteRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      role_id: roleId,
    },
  } = request;

  const deleteRoleParams = {
    roleId,
  };

  await deleteRole(this.repositories.roles, deleteRoleParams);

  return reply
    .code(204)
    .send()
  ;
}

export default deleteRoles;
