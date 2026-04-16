import { initSentry } from '#lib/sentry-instrument';
import { createLogger } from '#lib/logger';

import {
  authenticateOnRequest,
  consoleErrorHandler,
  consoleInteractionHandler,
  globalErrorHandler,
  replyBodyOnErrorHandler,
} from './hooks/index.ts';
import {
  batchGetSecretValue,
} from '#lib/secrets-manager';
import {
  Config,
} from '#config/index';
import {
  baseInformation,
} from './api-docs/base-information.ts';

import type {
  FastifyPluginCallback,
  FastifyBaseLogger,
} from 'fastify';

async function buildInstance() {
  await batchGetSecretValue();
  await initSentry();

  // Dynamic imports ensure all modules are loaded after Sentry.init() so instrumentation can patch them
  const Fastify = (await import('fastify')).default;
  const helmet = (await import('@fastify/helmet')).default;
  const cors = (await import('@fastify/cors')).default;
  const accepts = (await import('@fastify/accepts')).default;
  const compress = (await import('@fastify/compress')).default;
  const formBody = (await import('@fastify/formbody')).default;
  const rateLimit = (await import('@fastify/rate-limit')).default;
  const swagger = (await import('@fastify/swagger')).default;
  const swaggerUi = (await import('@fastify/swagger-ui')).default;
  const replyValidation = (await import('@fastify/response-validation')).default;

  const { default: plugins } = await import('./plugins/index.ts');
  const { default: routes } = await import('./routes/index.ts');

  const instance = Fastify({ ...Config.fastifyConfig, loggerInstance: createLogger() as FastifyBaseLogger });

  // register @fastify plugins
  instance.register(helmet, Config.helmetConfig);
  instance.register(cors, Config.corsConfig);
  instance.register(accepts);
  instance.register(compress, Config.compressConfig);
  instance.register(formBody);
  instance.register(rateLimit, Config.rateLimitConfig);
  instance.register(replyValidation as FastifyPluginCallback, Config.replyValidationConfig);

  // Register Swagger and Swagger UI only in non-prod environments
  if (!Config.liveEnvironments.includes(Config.apiEnv)) {
    instance.register(swagger, baseInformation);
    instance.register(swaggerUi, Config.swaggerConfig);
  }

  // decorate instance with hooks
  instance.decorate('authenticate', authenticateOnRequest);
  instance.decorateReply('error', null);
  instance.addHook('onError', consoleErrorHandler);
  instance.addHook('onResponse', consoleInteractionHandler);
  instance.addHook('onSend', replyBodyOnErrorHandler);

  // add global error handler
  instance.setErrorHandler(globalErrorHandler);

  // register other plugins and routes
  plugins.forEach((plugin) => instance.register(plugin));
  routes.forEach((route) => instance.register(route));

  return instance;
}

export default buildInstance;
