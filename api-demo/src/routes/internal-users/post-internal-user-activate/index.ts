import { activateUser } from '#services/internal-users/internal-users.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type Request = {
  Body: {
    token: string;
    password: string;
  };
};

async function postInternalUsersActivate(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      token,
      password,
    },
  } = request;

  const activateUserParams = {
    token,
    password,
  };

  await activateUser(this.repositories.internalUsers, activateUserParams);

  return reply
    .code(204)
    .send()
  ;
}

export default postInternalUsersActivate;
