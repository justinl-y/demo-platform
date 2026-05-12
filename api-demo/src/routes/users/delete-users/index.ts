import { deleteUsers as deleteUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
}

async function deleteUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
  } = request;

  const deleteUsersParams = {
    userId,
  };

  await deleteUsersService(this.repositories.users, deleteUsersParams);

  return reply
    .code(204)
    .send()
  ;
}

export default deleteUsers;
