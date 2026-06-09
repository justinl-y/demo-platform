import { inviteUser } from '#services/users/users.service';

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

  const inviteUserParams = {
    userId,
  };

  const result = await inviteUser(this.repositories.users, inviteUserParams);

  return reply
    .send(result)
  ;
}

export default patchUsersInvite;
