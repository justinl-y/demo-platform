import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import * as Sentry from '@sentry/node';

import { buildInteractionData } from './console-interaction-handler.ts';
import { Config } from '#config/index';

import type { InteractionData } from './console-interaction-handler.ts';

const SENTRY_EXCLUDED_STATUS_CODES = [400, 401, 403, 404, 409, 418];

type SentryAugmentedError = FastifyError & {
  interactionData?: InteractionData;
};

function processSentryError(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  try {
    const sentryError = error as SentryAugmentedError;

    try {
      sentryError.interactionData = buildInteractionData(request, reply) ?? undefined;
    }
    catch {
      // captured without interaction data
    }

    Sentry.captureException(sentryError);
  }
  catch {
    // Sentry failure must not affect the HTTP response
  }
};

function globalErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): unknown {
  const fastifyError = error;
  const statusCode = fastifyError.statusCode || 500;
  const responseBody = {
    statusCode,
    message: fastifyError.message || 'An unexpected error occurred',
  };

  reply.error = responseBody;
  reply.status(statusCode);

  if (Config.apiEnv !== 'TEST' && !SENTRY_EXCLUDED_STATUS_CODES.includes(statusCode)) processSentryError(error, request, reply);

  return reply.send(responseBody);
};

export default globalErrorHandler;
