import { passwordReset as passwordResetService } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type Request = {
  Body: {
    password_reset_token: string;
    new_password: string;
  };
};

async function passwordReset(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      password_reset_token: passwordResetToken,
      new_password: newPassword,
    },
  } = request;

  const passwordResetParams = {
    passwordResetToken,
    newPassword,
  };

  await passwordResetService(this.repositories.authentication, passwordResetParams);

  return reply
    .code(204)
    .send()
  ;
}

export default passwordReset;
