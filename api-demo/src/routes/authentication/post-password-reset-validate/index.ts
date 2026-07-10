import { validatePasswordResetToken as validatePasswordResetTokenService } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';
import type { PasswordReset } from '#shared/types';

type Request = {
  // Just the token from the shared reset contract — derived so the field name stays in sync.
  Body: Pick<PasswordReset, 'password_reset_token'>;
};

async function validatePasswordResetToken(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      password_reset_token: passwordResetToken,
    },
  } = request;

  await validatePasswordResetTokenService(this.repositories.authentication, { passwordResetToken });

  return reply
    .code(204)
    .send()
  ;
}

export default validatePasswordResetToken;
