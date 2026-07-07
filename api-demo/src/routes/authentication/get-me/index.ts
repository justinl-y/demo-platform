import { UnauthorizedError } from 'http-errors-enhanced';
import { fetchCurrentUser } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

async function getMe(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    user,
  } = request;

  // The authenticate onRequest hook populates request.user; guard for the type only.
  if (!user) throw new UnauthorizedError('Authentication failed');

  const result = await fetchCurrentUser(this.repositories.authentication, {
    email: user.email,
    permissions: user.permissions ?? [],
  });

  return reply.send(result);
}

export default getMe;
