import { passwordReset as passwordResetService } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';
import type { PasswordReset } from '#shared/types';

type Request = {
  Body: PasswordReset;
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
