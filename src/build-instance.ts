import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import * as Sentry from '@sentry/node';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import accepts from '@fastify/accepts';
import compress from '@fastify/compress';
import formBody from '@fastify/formbody';

import * as config from './config/index.ts';
import plugins from './plugins/index.ts';
import routes from './routes/index.ts';
import {
  consoleErrorHandler,
  consoleInteractionHandler,
  responseBodyOnErrorHandler,
  setSentryUserOnRequest,
} from './hooks/index.ts';
import { buildSentryInteractionMessage } from './hooks/interactions.ts';

import {
  batchGetSecretValue,
} from './util/secrets-manager.ts';

const MAX_BREADCRUMB_MESSAGE_LENGTH = 4096;

type SentryAugmentedError = FastifyError & {
  interactionConsoleLog?: string;
};

const buildFallbackInteractionMessage = (method: string, url: string, statusCode: number): string => {
  return `Route: ${method.toUpperCase()} ${url}\nResponse: ${statusCode}`;
};

async function buildInstance() {
  await batchGetSecretValue();

  await import('./util/sentry-instrument.ts');

  const instance = Fastify(config.fastify);

  // register @fastify plugins
  instance.register(helmet, config.helmet);
  instance.register(cors, config.cors);
  instance.register(accepts);
  instance.register(compress, config.compress);
  instance.register(formBody);

  // decorate instance with hooks
  instance.decorateReply('error', null);
  instance.addHook('onError', consoleErrorHandler);
  instance.addHook('onResponse', consoleInteractionHandler);
  instance.addHook('onSend', responseBodyOnErrorHandler);
  instance.addHook('onRequest', setSentryUserOnRequest);

  // add global error handler
  instance.setErrorHandler((error, request, reply) => {
    const fastifyError = error as FastifyError & { body?: { code?: string } };
    const statusCode = fastifyError.statusCode || 500;
    const responseBody = {
      code: fastifyError.code || fastifyError.body?.code,
      statusCode,
      message: fastifyError.message || 'An unexpected error occurred',
    };

    reply.error = responseBody;

    const fallbackInteractionMessage = buildFallbackInteractionMessage(request.method, request.url, statusCode);
    let interactionMessage: string;

    try {
      interactionMessage = buildSentryInteractionMessage(request, reply) ?? fallbackInteractionMessage;
    }
    catch {
      interactionMessage = fallbackInteractionMessage;
    }

    const breadcrumbMessage = interactionMessage.length > MAX_BREADCRUMB_MESSAGE_LENGTH
      ? `${interactionMessage.slice(0, MAX_BREADCRUMB_MESSAGE_LENGTH)}\n...[truncated]`
      : interactionMessage;

    const sentryError = error as SentryAugmentedError;
    sentryError.interactionConsoleLog = breadcrumbMessage;

    Sentry.captureException(sentryError);

    reply.status(statusCode).send(responseBody);
  });

  // register other plugins and routes
  plugins.forEach((plugin) => instance.register(plugin));
  routes.forEach((route) => instance.register(route));

  return instance;
  // instance.swagger();
}

export default buildInstance;
