import { initSentry } from '#lib/sentry-instrument';

import {
  authenticateOnRequest,
  authorizePreHandler,
  consoleErrorHandler,
  consoleInteractionHandler,
  globalErrorHandler,
  replyBodyOnErrorHandler,
} from './hooks/index.ts';
import {
  batchGetSecretValue,
} from '#lib/api-secrets';
import {
  Config,
} from '#config/index';
import {
  base,
} from './api-docs/base.ts';

import type { FastifyPluginCallback, onRouteHookHandler } from 'fastify';

// `onRoute` is an optional hook used by tooling (e.g. the OpenAPI generator) to inspect each route's
// config — notably `config.permission` — as it registers. Unused by the running server.
async function buildInstance(options?: { onRoute?: onRouteHookHandler }) {
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

  const {
    default: plugins,
  } = await import('./plugins/index.ts');
  const {
    default: routes,
  } = await import('./routes/index.ts');

  const instance = Fastify(Config.fastifyConfig);

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
    instance.register(swagger, base);
    instance.register(swaggerUi, Config.swaggerConfig);
  }

  // decorate instance with hooks
  instance.decorate('authenticate', authenticateOnRequest);
  instance.decorate('authorize', authorizePreHandler);
  instance.decorateReply('error', null);
  instance.addHook('onError', consoleErrorHandler);
  instance.addHook('onResponse', consoleInteractionHandler);
  instance.addHook('onSend', replyBodyOnErrorHandler);

  // add global error handler
  instance.setErrorHandler(globalErrorHandler);

  // Added before routes register so it fires for each of them (used by tooling to read config).
  if (options?.onRoute) instance.addHook('onRoute', options.onRoute);

  // register other plugins and routes
  plugins.forEach((plugin) => instance.register(plugin));
  routes.forEach((route) => instance.register(route));

  if (Config.apiEnv === 'TEST' && process.env.NODE_V8_COVERAGE) {
    const {
      default: devRoutes,
    } = await import('./routes/dev/index.ts');
    instance.register(devRoutes);
  }

  return instance;
}

export default buildInstance;
