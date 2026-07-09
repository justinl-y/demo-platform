import { validatePasswordResetToken as validatePasswordResetTokenService } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type Request = {
  Body: {
    password_reset_token: string;
  };
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
