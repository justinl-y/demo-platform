import { editPermission } from '#services/permissions/permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    permission_id: string;
  };
  Body: {
    name: string;
    description: string;
  };
}

async function putPermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      permission_id: permissionId,
    },
    body: {
      name,
      description,
    },
  } = request;

  const editPermissionParams = {
    permissionId,
    name,
    description,
  };

  const result = await editPermission(this.repositories.permissions, editPermissionParams);

  return reply
    .send(result)
  ;
}

export default putPermissions;
