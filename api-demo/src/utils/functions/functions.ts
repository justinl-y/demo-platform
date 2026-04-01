import type { RouteHandlerMethod } from 'fastify';

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
};
