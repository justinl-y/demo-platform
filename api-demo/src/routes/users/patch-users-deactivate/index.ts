import { patchUsersDeactivate as patchUsersDeactivateService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
}

async function patchUsersDeactivate(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
  } = request;

  const patchUsersDeactivateParams = {
    userId,
  };

  await patchUsersDeactivateService(this.repositories.users, patchUsersDeactivateParams);

  return reply
    .code(204)
    .send()
  ;
}

export default patchUsersDeactivate;
