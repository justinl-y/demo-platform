import { createPermission } from '#services/permissions/permissions.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Body: {
    name: string;
    description: string;
  };
}

async function postPermissions(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      name,
      description,
    },
  } = request;

  const createPermissionParams = {
    name,
    description,
  };

  const result = await createPermission(this.repositories.permissions, createPermissionParams);

  return reply
    .code(201)
    .send(result);
}

export default postPermissions;
