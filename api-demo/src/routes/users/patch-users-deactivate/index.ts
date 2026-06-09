import { deactivateUser } from '#services/users/users.service';

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

  const deactivateUserParams = {
    userId,
  };

  const result = await deactivateUser(this.repositories.users, deactivateUserParams);

  return reply
    .send(result)
  ;
}

export default patchUsersDeactivate;
