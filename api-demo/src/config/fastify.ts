import { createLogger } from '#lib/logger';
import { ajvPlugins } from './ajv.ts';

import type { IncomingMessage, ServerResponse } from 'http';
import type { FastifyBaseLogger, FastifyServerOptions } from 'fastify';

const fastifyConfig: FastifyServerOptions = {
  loggerInstance: createLogger() as FastifyBaseLogger,
  trustProxy: true,
  disableRequestLogging: true, // interaction hooks handle request/response logging
  ajv: {
    plugins: ajvPlugins,
    customOptions: {
      coerceTypes: false,
      strict: false, // Allow additional properties (eg. `example` for documentation)
    },
  },
  routerOptions: {
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
    // caseSensitive: false,
    onBadUrl: (path: string, request: IncomingMessage, reply: ServerResponse) => {
      const encodedPath = encodeURIComponent(path);

      reply.statusCode = 400;
      reply.setHeader('Content-Type', 'text/plain; charset=utf-8');
      reply.end(`Bad path: ${encodedPath}`);
    },
    defaultRoute: (request: IncomingMessage, reply: ServerResponse) => {
      reply.statusCode = 404;
      reply.end();
    },
  },
};

export {
  fastifyConfig,
};
