import { deleteUser } from '#services/users/users.service';

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

  const deleteUserParams = {
    userId,
  };

  await deleteUser(this.repositories.users, deleteUserParams);

  return reply
    .code(204)
    .send()
  ;
}

export default deleteUsers;
