import { editRole } from '#services/roles/roles.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    role_id: string;
  };
  Body: {
    name: string;
    description: string;
  };
}

async function putRoles(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      role_id: roleId,
    },
    body: {
      name,
      description,
    },
  } = request;

  const editRoleParams = {
    roleId,
    name,
    description,
  };

  const result = await editRole(this.repositories.roles, editRoleParams);

  return reply
    .send(result)
  ;
}

export default putRoles;
