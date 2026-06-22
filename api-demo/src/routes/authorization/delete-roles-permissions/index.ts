import { deleteRolePermissions as deleteRolePermissionsService } from '#services/roles-permissions/roles-permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    role_id: string;
  };
}

async function deleteRolePermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      role_id: roleId,
    },
  } = request;

  const deleteRolePermissionsParams = {
    roleId,
  };

  await deleteRolePermissionsService(this.repositories.rolePermissions, this.repositories.roles, deleteRolePermissionsParams);

  return reply
    .code(204)
    .send()
  ;
}

export default deleteRolePermissions;
