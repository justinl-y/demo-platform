import { editUserEmail } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
  Body: {
    new_email: string;
  };
}

async function patchUsersEmail(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
    body: {
      new_email: newEmail,
    },
  } = request;

  const editUserEmailParams = {
    userId,
    newEmail,
  };

  const result = await editUserEmail(this.repositories.users, editUserEmailParams);

  return reply
    .send(result)
  ;
}

export default patchUsersEmail;
