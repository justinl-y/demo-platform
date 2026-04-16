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

type RouteProperties<H extends RouteHandlerMethod = RouteHandlerMethod> = {
  method: string;
  url: string;
  handler: H;
};

type OnRequestProperties = {
  onRequest: onRequestHookHandler[];
};

type PreHandlerProperties = {
  preHandler: preHandlerHookHandler[];
};

function getServerDetails(serverAddress: AddressInfo | string | null): string {
  // Use a type guard to safely check if it's an AddressInfo object
  if (serverAddress && typeof serverAddress !== 'string') {
    const {
      port,
      address: ipAddress,
    } = serverAddress as AddressInfo;

    return `... Server is listening on ${ipAddress}:${port} ${Config.apiEnv !== 'PROD' ? `(${localHost})` : ''}`;
  }
  else if (typeof serverAddress === 'string') {
    return `... Server is listening on ${serverAddress}`;
  }

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

function cwd(file: string, relativePath: string) {
  return path.resolve(relativePath, file);
}

export {
  routePropertiesCore,
  routePropertiesOnRequest,
  routePropertiesPrehandler,
  getServerDetails,
  cwd,
};
