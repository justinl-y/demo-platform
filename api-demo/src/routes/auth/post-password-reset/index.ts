import { passwordReset as passwordResetService } from '#services/auth/auth.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type Request = {
  Body: {
    new_password: string;
    password_reset_token: string;
  };
};

async function passwordReset(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      new_password: newPassword,
      password_reset_token: passwordResetToken,
    },
  } = request;

  const passwordResetParams = {
    newPassword,
    passwordResetToken,
  };

  await passwordResetService(this.repositories.auth, passwordResetParams);

  return reply
    .code(204)
    .send()
  ;
}

export default passwordReset;
