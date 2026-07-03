import { createUser } from '#services/internal-users/internal-users.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  Body: {
    email: string;
    full_name: string;
    known_as?: string | null;
  };
}

async function postInternalUsers(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      email,
      full_name: fullName,
      known_as: knownAs,
    },
  } = request;

  const createUserParams = {
    email,
    fullName,
    knownAs: knownAs ?? null,
  };

  const result = await createUser(this.repositories.internalUsers, createUserParams);

  return reply
    .code(201)
    .send(result);
}

export default postInternalUsers;
