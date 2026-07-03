import { deactivateUser } from '#services/internal-users/internal-users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
}

async function patchInternalUsersDeactivate(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
  } = request;

  const deactivateUserParams = {
    userId,
  };

  const result = await deactivateUser(this.repositories.internalUsers, deactivateUserParams);

  return reply
    .send(result)
  ;
}

export default patchInternalUsersDeactivate;
