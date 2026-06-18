import { assignRolePermissions } from '#services/roles-permissions/roles-permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    role_id: string;
  };
  Body: {
    permissions: string[];
  };
}

async function postRolePermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      role_id: roleId,
    },
    body: {
      permissions,
    },
  } = request;

  const assignRolePermissionsParams = {
    roleId,
    permissionIds: permissions,
  };

  const result = await assignRolePermissions(this.repositories.rolePermissions, this.repositories.roles, this.repositories.permissions, assignRolePermissionsParams);

  return reply
    .code(201)
    .send(result);
}

export default postRolePermissions;
