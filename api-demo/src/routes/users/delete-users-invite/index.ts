import { cancelUserInvite } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
}

async function deleteUsersInvite(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
  } = request;

  const cancelUserInviteParams = {
    userId,
  };

  const result = await cancelUserInvite(this.repositories.users, cancelUserInviteParams);

  return reply
    .send(result)
  ;
}

export default deleteUsersInvite;
