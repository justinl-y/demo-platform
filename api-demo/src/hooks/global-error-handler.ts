import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { processSentryError } from '#lib/sentry-instrument';

function globalErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): unknown {
  const statusCode = error.statusCode || 500;
  const responseBody = {
    statusCode,
    message: error.message || 'An unexpected error occurred',
  };

  reply.error = responseBody;
  reply.status(statusCode);

  processSentryError(statusCode, error, request, reply);

  return reply.send(responseBody);
}

export default globalErrorHandler;
