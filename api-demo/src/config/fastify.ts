import ajvFormats from 'ajv-formats';
import customAjvFormatsPlugin from '../plugins/customAjvFormats.ts';

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
    onBadUrl: (path: string, req: IncomingMessage, res: ServerResponse) => {
      const encodedPath = encodeURIComponent(path);

      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(`Bad path: ${encodedPath}`);
    },
    defaultRoute: (req: IncomingMessage, res: ServerResponse) => {
      res.statusCode = 404;
      res.end();
    },
  },
};

export {
  fastifyConfig,
};
