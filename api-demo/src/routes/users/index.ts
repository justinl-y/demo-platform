import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import onRequest from './on-request.ts';
import preHandlers from './pre-handlers.ts';

import getUsers from './get-users/index.ts';
import postUsers from './post-users/index.ts';
import deleteUsers from './delete-users/index.ts';
import patchUsersDeactivate from './patch-users-deactivate/index.ts';

import type {
  FastifyInstance,
  RouteHandlerMethod,
} from 'fastify';

const {
  GET,
  POST,
  DELETE,
  PATCH,
} = HTTP_METHODS;

const routes = {
  getUsers: routePropertiesCore(GET, '/users', getUsers as RouteHandlerMethod),
  postUsers: routePropertiesCore(POST, '/users', postUsers as RouteHandlerMethod),
  deleteUsers: routePropertiesCore(DELETE, '/users/:user_id', deleteUsers as RouteHandlerMethod),
  patchUsersDeactivate: routePropertiesCore(PATCH, '/users/deactivate/:user_id', patchUsersDeactivate as RouteHandlerMethod),
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
