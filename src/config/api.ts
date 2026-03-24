import ajvFormats from 'ajv-formats';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyServerOptions } from 'fastify';

import customAjvFormatsPlugin from '../plugins/customAjvFormats.ts';

const apiEnv: 'TEST' | 'STAGE' | 'PROD' = (process.env.API_ENV || 'TEST').toUpperCase() as 'TEST' | 'STAGE' | 'PROD';

const compress = {
  global: true,
} as const;

const cors = {
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'X-Altrac-Application',
  ],
  credentials: true,
  exposedHeaders: [
    'Authorization',
  ],
  maxAge: 5,
  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS',
  ],
  origin: [
    'http://localhost:3000',
  ],
};

const externalPort = apiEnv === 'TEST' ? '6663' : '6662' as const;

type AjvPlugins = NonNullable<NonNullable<FastifyServerOptions['ajv']>['plugins']>;
type AjvPlugin = Exclude<AjvPlugins[number], [unknown, unknown]>;

const ajvFormatsPlugin = ajvFormats as unknown as AjvPlugin;

const fastify: FastifyServerOptions = {
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
      res.statusCode = 400;
      res.end(`Bad path: ${path}`);
    },
    defaultRoute: (req: IncomingMessage, res: ServerResponse) => {
      res.statusCode = 404;
      res.end();
    },
  },
};

const helmet = {
  global: true,
} as const;

const server = {
  port: 8000,
  host: '0.0.0.0',
} as const;

const user = {
  allowedCountries: [
    'UNITED STATES',
    'ARGENTINA',
    'CANADA',
    'CHILE',
  ],
  password: {
    passLength: 8,
    saltWorkFactor: 10,
    expirationTime: '30d',
  },
  phoneLength: 10,
  resetPassword: {
    randomBytesLength: 20,
    expirationTime: '28d',
  },
  zipCodeLength: 5,
} as const;

if (apiEnv === 'PROD') {
  cors.origin = [
    'https://altrac.io',
    'https://app.altrac.io',
    'https://admin.altrac.io',
    'https://altrac.com',
    'https://app.altrac.com',
    'https://admin.altrac.com',
  ];
};

export {
  apiEnv,
  compress,
  cors,
  externalPort,
  fastify,
  helmet,
  server,
  user,
};
