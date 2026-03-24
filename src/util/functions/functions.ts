import type { RouteHandlerMethod } from 'fastify';

type RouteProperties = {
  method: string;
  url: string;
  handler: RouteHandlerMethod;
};

const routePropertiesCore = (method: string, url: string, handler: RouteHandlerMethod): RouteProperties => ({
  method,
  url,
  handler,
});

export {
  routePropertiesCore,
};
