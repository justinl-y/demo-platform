import { ForbiddenError } from 'http-errors-enhanced';
import type { FastifyRequest, FastifyReply } from 'fastify';

async function authorizePreHandler(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const {
    routeOptions: {
      config: {
        permission,
      },
    },
  } = request;

  // unauthorized routes
  if (!permission) return;

  // authorized routes
  if (!request.user?.permissions?.includes(permission)) throw new ForbiddenError('Not Authorized');
}

export default authorizePreHandler;
