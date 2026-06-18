import { passwordForgot as passwordForgotService } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type Request = {
  Body: {
    email: string;
  };
};

async function passwordForgot(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      email,
    },
  } = request;

  const passwordForgotParams = {
    email,
  };

  await passwordForgotService(this.repositories.authentication, passwordForgotParams);

  return reply
    .code(204)
    .send()
  ;
}

export default passwordForgot;
