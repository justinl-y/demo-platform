import { deleteUsersInvite as deleteUsersInviteService } from '#services/users/users.service';

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

  const deleteUsersInviteParams = {
    userId,
  };

  const result = await deleteUsersInviteService(this.repositories.users, deleteUsersInviteParams);

  return reply
    .send(result)
  ;
}

export default deleteUsersInvite;
