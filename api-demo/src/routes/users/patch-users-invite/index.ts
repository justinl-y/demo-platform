import { patchUsersInvite as patchUsersInviteService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
}

async function patchUsersInvite(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
  } = request;

  const patchUsersInviteParams = {
    userId,
  };

  const result = await patchUsersInviteService(this.repositories.users, patchUsersInviteParams);

  return reply
    .send(result)
  ;
}

export default patchUsersInvite;
