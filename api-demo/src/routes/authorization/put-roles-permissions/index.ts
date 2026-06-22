import { editRolePermissions } from '#services/roles-permissions/roles-permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    role_id: string;
  };
  Body: {
    permissions: string[];
  };
}

async function putRolePermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      role_id: roleId,
    },
    body: {
      permissions,
    },
  } = request;

  const editRolePermissionsParams = {
    roleId,
    permissionIds: permissions,
  };

  const result = await editRolePermissions(this.repositories.rolePermissions, this.repositories.roles, this.repositories.permissions, editRolePermissionsParams);

  return reply
    .send(result)
  ;
}

export default putRolePermissions;
