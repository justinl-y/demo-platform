import { activateUser } from '#services/users/users.service';

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

async function postUsersActivate(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
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

  await activateUser(this.repositories.users, activateUserParams);

  return reply
    .code(204)
    .send()
  ;
}

export default postUsersActivate;
