import path from 'path';

import { Config } from '#config/index';
import { localHost } from './constants.ts';
import { setWithSpan } from '#decorators/with-span';

import type { AddressInfo } from 'net';
import type {
  onRequestHookHandler,
  preHandlerHookHandler,
  RouteHandlerMethod,
} from 'fastify';

interface RouteProperties<H extends RouteHandlerMethod = RouteHandlerMethod> {
  method: string;
  url: string;
  handler: H;
};

interface OnRequestProperties {
  onRequest: onRequestHookHandler[];
};

interface PreHandlerProperties {
  preHandler: preHandlerHookHandler[];
};

interface RouteSchema {
  route: Record<string, unknown>;
  body?: Record<string, unknown>;
  response: Record<string, unknown>;
}

interface SchemaProperties {
  schema: {
    body?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

function getServerDetails(serverAddress: AddressInfo | string | null): string {
  if (serverAddress && typeof serverAddress !== 'string') {
    const {
      port,
      address: ipAddress,
    } = serverAddress;

    return `... Server is listening on ${ipAddress}:${port} ${Config.apiEnv !== 'PROD' ? `(${localHost})` : ''}`;
  }

  if (typeof serverAddress === 'string') return `... Server is listening on ${serverAddress}`;

  return '... Server address information is unavailable';
}

function routePropertiesCore(method: string, url: string, handler: RouteHandlerMethod): RouteProperties {
  return {
    method,
    url,
    handler: setWithSpan(handler.name, handler),
  };
};

function routePropertiesOnRequest(onRequest: onRequestHookHandler[]): OnRequestProperties {
  return {
    onRequest,
  };
};

function routePropertiesPrehandler(preHandler: preHandlerHookHandler[]): PreHandlerProperties {
  return {
    preHandler,
  };
}

function routeSchema({ route, body, response }: RouteSchema): SchemaProperties {
  const schemaObject = {
    schema: {
      ...route,
      response,
    },
  } as SchemaProperties;

  // querystring
  // params
  if (body) schemaObject.schema.body = body;

  return schemaObject;
}

function cwd(file: string, relativePath: string) {
  return path.resolve(relativePath, file);
}

export {
  routePropertiesCore,
  routePropertiesOnRequest,
  routePropertiesPrehandler,
  routeSchema,
  getServerDetails,
  cwd,
};
