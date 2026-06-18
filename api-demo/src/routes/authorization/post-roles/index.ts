import { createRole } from '#services/roles/roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Body: {
    name: string;
    description: string;
  };
}

async function postRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      name,
      description,
    },
  } = request;

  const createRoleParams = {
    name,
    description,
  };

  const result = await createRole(this.repositories.roles, createRoleParams);

  return reply
    .code(201)
    .send(result);
}

export default postRoles;
