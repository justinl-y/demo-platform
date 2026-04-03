import ajvFormats from 'ajv-formats';
import customAjvFormatsPlugin from '../plugins/custom-ajv-formats.ts';

import type { IncomingMessage, ServerResponse } from 'http';
import type { FastifyServerOptions } from 'fastify';

type AjvPlugins = NonNullable<NonNullable<FastifyServerOptions['ajv']>['plugins']>;
type AjvPlugin = Exclude<AjvPlugins[number], [unknown, unknown]>;

const ajvFormatsPlugin = ajvFormats as unknown as AjvPlugin;

const fastifyConfig: FastifyServerOptions = {
  logger: false,
  ajv: {
    plugins: [
      [ajvFormatsPlugin, { mode: 'full' }],
      customAjvFormatsPlugin as AjvPlugin,
    ],
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
