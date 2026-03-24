import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
// import Sentryfrom '@sentry/node';
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
} from './hooks/index.ts';

import {
  batchGetSecretValue,
} from './util/secrets-manager.ts';

// for addition of reply.error property
declare module 'fastify' {
  interface FastifyReply {
    error?: unknown;
  }
}

async function buildInstance() {
  await batchGetSecretValue();
  // require('./util/sentry-instrument');

  const instance = Fastify(config.fastify);

  // Sentry.setupFastifyErrorHandler(instance);

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

  // add global error handler
  instance.setErrorHandler((error, request, reply) => {
    const fastifyError = error as FastifyError & { body?: { code?: string } };
    const statusCode = fastifyError.statusCode || 500;

    reply.status(statusCode).send({
      code: fastifyError.code || fastifyError.body?.code,
      statusCode,
      message: fastifyError.message || 'An unexpected error occurred',
    });
  });

  // register other plugins and routes
  plugins.forEach((plugin) => instance.register(plugin));
  routes.forEach((route) => instance.register(route));

  return instance;
  // instance.swagger();
}

export default buildInstance;
