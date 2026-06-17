import {
  httpMethods,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import onRequest from './on-request.ts';
import preHandlers from './pre-handlers.ts';

import getPermissions from './get-permissions/index.ts';
import postPermissions from './post-permissions/index.ts';
import putPermissions from './put-permissions/index.ts';
import deletePermissions from './delete-permissions/index.ts';

import type {
  FastifyInstance,
  RouteHandlerMethod,
} from 'fastify';

const {
  GET,
  POST,
  DELETE,
  PUT,
} = httpMethods;

const routes = {
  getPermissions: routePropertiesCore(GET, '/permissions', getPermissions as RouteHandlerMethod, 'INTERNAL_PERMISSIONS_READ'),
  postPermissions: routePropertiesCore(POST, '/permissions', postPermissions as RouteHandlerMethod, 'INTERNAL_PERMISSIONS_WRITE'),
  putPermissions: routePropertiesCore(PUT, '/permissions/:permission_id', putPermissions as RouteHandlerMethod, 'INTERNAL_PERMISSIONS_WRITE'),
  deletePermissions: routePropertiesCore(DELETE, '/permissions/:permission_id', deletePermissions as RouteHandlerMethod, 'INTERNAL_PERMISSIONS_WRITE'),
};

export type RouteKey = keyof typeof routes;

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<RouteKey>).forEach((key) => {
    const value = routes[key];

    instance.route({
      ...value,
      ...schema[key],
      ...onRequest.call(instance, key),
      ...preHandlers.call(instance, key),
    });
  });
};
