import { Config } from '#config/index';
import { localHost } from './constants.ts';

import type { AddressInfo } from 'net';
import type { RouteHandlerMethod } from 'fastify';

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
    return `...Server is listening on ${serverAddress}`;
  }

  return 'Server address information is unavailable.';
}

type RouteProperties = {
  method: string;
  url: string;
  handler: RouteHandlerMethod;
};

function routePropertiesCore(method: string, url: string, handler: RouteHandlerMethod): RouteProperties {
  return {
    method,
    url,
    handler,
  };
};

export {
  routePropertiesCore,
  getServerDetails,
};
