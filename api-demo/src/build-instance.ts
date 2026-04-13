import { initSentry } from '#utils/sentry-instrument';
import { createLogger } from '#utils/logger';

import Fastify from 'fastify';
import type { FastifyBaseLogger } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import accepts from '@fastify/accepts';
import compress from '@fastify/compress';
import formBody from '@fastify/formbody';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import replyValidation from '@fastify/response-validation';

import {
  authenticateOnRequest,
  consoleErrorHandler,
  consoleInteractionHandler,
  globalErrorHandler,
  replyBodyOnErrorHandler,
  setSentryUserOnRequest,
} from './hooks/index.ts';
import {
  batchGetSecretValue,
} from '#utils/secrets-manager';
import {
  Config,
} from '#config/index';
import {
  baseInformation,
} from './api-docs/base-information.ts';

import type { FastifyPluginCallback } from 'fastify';

async function buildInstance() {
  await batchGetSecretValue();
  await initSentry();

  // Dynamic imports ensure all modules are loaded after Sentry.init() so instrumentation can patch them
  const { default: plugins } = await import('./plugins/index.ts');
  const { default: routes } = await import('./routes/index.ts');

  const instance = Fastify({ ...Config.fastifyConfig, loggerInstance: createLogger() as FastifyBaseLogger });

  // register @fastify plugins
  instance.register(helmet, Config.helmetConfig);
  instance.register(cors, Config.corsConfig);
  instance.register(accepts);
  instance.register(compress, Config.compressConfig);
  instance.register(formBody);
  instance.register(replyValidation as FastifyPluginCallback, Config.replyValidationConfig);

  // Register Swagger and Swagger UI only in non-prod environments
  if (Config.apiEnv !== 'PROD') {
    instance.register(swagger, baseInformation);
    instance.register(swaggerUi, Config.swaggerConfig);
  }

  // decorate instance with hooks
  instance.decorate('authenticate', authenticateOnRequest);
  instance.decorateReply('error', null);
  instance.addHook('onError', consoleErrorHandler);
  instance.addHook('onResponse', consoleInteractionHandler);
  instance.addHook('onSend', replyBodyOnErrorHandler);
  instance.addHook('onRequest', setSentryUserOnRequest);

  // add global error handler
  instance.setErrorHandler(globalErrorHandler);

  // register other plugins and routes
  plugins.forEach((plugin) => instance.register(plugin));
  routes.forEach((route) => instance.register(route));

  return instance;
}

export default buildInstance;
