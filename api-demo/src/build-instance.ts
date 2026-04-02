import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import accepts from '@fastify/accepts';
import compress from '@fastify/compress';
import formBody from '@fastify/formbody';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import responseValidation from '@fastify/response-validation';
import type { FastifyPluginCallback } from 'fastify';

import plugins from './plugins/index.ts';
import routes from './routes/index.ts';
import {
  consoleErrorHandler,
  consoleInteractionHandler,
  globalErrorHandler,
  responseBodyOnErrorHandler,
  setSentryUserOnRequest,
} from './hooks/index.ts';
import {
  batchGetSecretValue,
} from '#utils/secrets-manager';
import {
  swaggerConfig,
} from '#config/swagger';
import {
  fastifyConfig,
} from '#config/fastify';
import {
  compressConfig,
  corsConfig,
  helmetConfig,
} from '#config/api';
import {
  responseValidationConfig,
} from '#config/response-validation';
import {
  baseInformation,
} from './api-docs/base-information.ts';

async function buildInstance() {
  await batchGetSecretValue();

  await import('#utils/sentry-instrument');

  const instance = Fastify(fastifyConfig);

  // register @fastify plugins
  instance.register(helmet, helmetConfig);
  instance.register(cors, corsConfig);
  instance.register(accepts);
  instance.register(compress, compressConfig);
  instance.register(formBody);
  instance.register(responseValidation as FastifyPluginCallback, responseValidationConfig);

  // Register Swagger and Swagger UI only in non-prod environments
  if (process.env.NODE_ENV !== 'PROD') {
    instance.register(swagger, baseInformation);
    instance.register(swaggerUi, swaggerConfig);
  }

  // decorate instance with hooks
  instance.decorateReply('error', null);
  instance.addHook('onError', consoleErrorHandler);
  instance.addHook('onResponse', consoleInteractionHandler);
  instance.addHook('onSend', responseBodyOnErrorHandler);
  instance.addHook('onRequest', setSentryUserOnRequest);

  // add global error handler
  instance.setErrorHandler(globalErrorHandler);

  // register other plugins and routes
  plugins.forEach((plugin) => instance.register(plugin));
  routes.forEach((route) => instance.register(route));

  return instance;
}

export default buildInstance;
