import { putUsers as putUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Params: {
    user_id: string;
  };
  Body: {
    full_name: string;
    known_as?: string | null;
  };
}

async function putUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    params: {
      user_id: userId,
    },
    body: {
      full_name: fullName,
      known_as: knownAs,
    },
  } = request;

  const putUsersParams = {
    userId,
    fullName,
    knownAs,
  };

  const result = await putUsersService(this.repositories.users, putUsersParams);

  return reply
    .send(result)
  ;
}

export default putUsers;
