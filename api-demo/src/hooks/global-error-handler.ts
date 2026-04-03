import type {
  FastifyError,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import * as Sentry from '@sentry/node';

import { buildSentryInteractionMessage } from './console-interaction-handler.ts';
import { Config } from '#config/index';

const MAX_BREADCRUMB_MESSAGE_LENGTH = 4096;
const TRUNCATED_SUFFIX = '\n...[truncated]';

type SentryAugmentedError = FastifyError & {
  interactionConsoleLog?: string;
};

function buildFallbackInteractionMessage(method: string, url: string, statusCode: number): string {
  return `Route: ${method.toUpperCase()} ${url}\nResponse: ${statusCode}`;
};

function processSentryError(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
  statusCode: number,
): void {
  const fallbackInteractionMessage = buildFallbackInteractionMessage(request.method, request.url, statusCode);
  let interactionMessage: string;

  try {
    interactionMessage = buildSentryInteractionMessage(request, reply) ?? fallbackInteractionMessage;
  }
  catch {
    interactionMessage = fallbackInteractionMessage;
  }

  const breadcrumbMessage = interactionMessage.length > MAX_BREADCRUMB_MESSAGE_LENGTH
    ? (() => {
        if (MAX_BREADCRUMB_MESSAGE_LENGTH <= TRUNCATED_SUFFIX.length) {
          return TRUNCATED_SUFFIX.slice(0, MAX_BREADCRUMB_MESSAGE_LENGTH);
        }

        const maxMessageLength = MAX_BREADCRUMB_MESSAGE_LENGTH - TRUNCATED_SUFFIX.length;

        return `${interactionMessage.slice(0, maxMessageLength)}${TRUNCATED_SUFFIX}`;
      })()
    : interactionMessage;

  const sentryError = error as SentryAugmentedError;

  sentryError.interactionConsoleLog = breadcrumbMessage;

  Sentry.captureException(sentryError);
};

function globalErrorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): unknown {
  const fastifyError = error;
  const statusCode = fastifyError.statusCode || 500;
  const responseBody = {
    statusCode,
    message: fastifyError.message || 'An unexpected error occurred',
  };

  reply.error = responseBody;

  reply
    .status(statusCode)
    .send(responseBody)
  ;

  if (Config.apiEnv !== 'TEST') processSentryError(error, request, reply, statusCode);

  return reply;
};

export default globalErrorHandler;
