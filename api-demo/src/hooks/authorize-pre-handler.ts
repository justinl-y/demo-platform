import { ForbiddenError } from 'http-errors-enhanced';
import type { FastifyRequest, FastifyReply } from 'fastify';

async function authorizePreHandler(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const {
    permission,
  } = request.routeOptions.config;

  if (!permission) return;

  if (!request.user?.permissions?.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export default authorizePreHandler;
