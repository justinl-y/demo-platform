import { deletePermission } from '#services/permissions/permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    permission_id: string;
  };
}

async function deletePermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      permission_id: permissionId,
    },
  } = request;

  const deletePermissionParams = {
    permissionId,
  };

  await deletePermission(this.repositories.permissions, this.repositories.rolePermissions, deletePermissionParams);

  return reply
    .code(204)
    .send()
  ;
}

export default deletePermissions;
