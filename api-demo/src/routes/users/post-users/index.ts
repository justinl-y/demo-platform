import { postUsers as postUsersService } from '#services/users/users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Body: {
    email: string;
    full_name: string;
    known_as?: string | null;
  };
}

async function postUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      email: emailRaw,
      full_name: fullName,
      known_as: knownAs,
    },
  } = request;

  const postUsersParams = {
    email: emailRaw.toLowerCase(),
    fullName,
    knownAs: knownAs ?? null,
  };

  const result = await postUsersService(this.repositories.users, postUsersParams);

  return reply
    .code(201)
    .send(result);
}

export default postUsers;
