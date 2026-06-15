import {
  httpMethods,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import onRequest from './on-request.ts';
import preHandlers from './pre-handlers.ts';

import getUsers from './get-users/index.ts';
import postUsers from './post-users/index.ts';
import putUsers from './put-users/index.ts';
import patchUsersEmail from './patch-users-email/index.ts';
import deleteUsers from './delete-users/index.ts';
import postUsersActivate from './post-user-activate/index.ts';
import patchUsersInvite from './patch-users-invite/index.ts';
import deleteUsersInvite from './delete-users-invite/index.ts';
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
  PUT,
} = httpMethods;

const routes = {
  getUsers: routePropertiesCore(GET, '/users', getUsers as RouteHandlerMethod, 'USERS_READ'),
  postUsers: routePropertiesCore(POST, '/users', postUsers as RouteHandlerMethod, 'USERS_WRITE'),
  putUsers: routePropertiesCore(PUT, '/users/:user_id', putUsers as RouteHandlerMethod, 'USERS_WRITE'),
  patchUsersEmail: routePropertiesCore(PATCH, '/users/:user_id/email', patchUsersEmail as RouteHandlerMethod, 'USERS_WRITE'),
  deleteUsers: routePropertiesCore(DELETE, '/users/:user_id', deleteUsers as RouteHandlerMethod, 'USERS_WRITE'),
  patchUsersInvite: routePropertiesCore(PATCH, '/users/:user_id/invite', patchUsersInvite as RouteHandlerMethod, 'USERS_AUTHORIZE'),
  deleteUsersInvite: routePropertiesCore(DELETE, '/users/:user_id/invite', deleteUsersInvite as RouteHandlerMethod, 'USERS_AUTHORIZE'),
  postUsersActivate: routePropertiesCore(POST, '/users/activate', postUsersActivate as RouteHandlerMethod),
  patchUsersDeactivate: routePropertiesCore(PATCH, '/users/:user_id/deactivate', patchUsersDeactivate as RouteHandlerMethod, 'USERS_AUTHORIZE'),
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
