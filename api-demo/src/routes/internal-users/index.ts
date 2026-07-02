import {
  httpMethods,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import onRequest from './on-request.ts';
import preHandlers from './pre-handlers.ts';

import getInternalUsers from './get-internal-users/index.ts';
import getInternalUsersRoles from './get-internal-users-roles/index.ts';
import postInternalUsersRoles from './post-internal-users-roles/index.ts';
import putInternalUsersRoles from './put-internal-users-roles/index.ts';
import deleteInternalUsersRoles from './delete-internal-users-roles/index.ts';
import postInternalUsers from './post-internal-users/index.ts';
import putInternalUsers from './put-internal-users/index.ts';
import patchInternalUsersEmail from './patch-internal-users-email/index.ts';
import deleteInternalUsers from './delete-internal-users/index.ts';
import postInternalUsersActivate from './post-internal-user-activate/index.ts';
import patchInternalUsersInvite from './patch-internal-users-invite/index.ts';
import deleteInternalUsersInvite from './delete-internal-users-invite/index.ts';
import patchInternalUsersDeactivate from './patch-internal-users-deactivate/index.ts';

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
  getInternalUsers: routePropertiesCore(GET, '/internal-users', getInternalUsers as RouteHandlerMethod, 'INTERNAL_USERS_READ'),
  postInternalUsers: routePropertiesCore(POST, '/internal-users', postInternalUsers as RouteHandlerMethod, 'INTERNAL_USERS_WRITE'),
  putInternalUsers: routePropertiesCore(PUT, '/internal-users/:user_id', putInternalUsers as RouteHandlerMethod, 'INTERNAL_USERS_WRITE'),
  patchInternalUsersEmail: routePropertiesCore(PATCH, '/internal-users/:user_id/email', patchInternalUsersEmail as RouteHandlerMethod, 'INTERNAL_USERS_WRITE'),
  deleteInternalUsers: routePropertiesCore(DELETE, '/internal-users/:user_id', deleteInternalUsers as RouteHandlerMethod, 'INTERNAL_USERS_WRITE'),
  patchInternalUsersInvite: routePropertiesCore(PATCH, '/internal-users/:user_id/invite', patchInternalUsersInvite as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_WRITE'),
  deleteInternalUsersInvite: routePropertiesCore(DELETE, '/internal-users/:user_id/invite', deleteInternalUsersInvite as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_WRITE'),
  postInternalUsersActivate: routePropertiesCore(POST, '/internal-users/activate', postInternalUsersActivate as RouteHandlerMethod),
  patchInternalUsersDeactivate: routePropertiesCore(PATCH, '/internal-users/:user_id/deactivate', patchInternalUsersDeactivate as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_WRITE'),
  getInternalUsersRoles: routePropertiesCore(GET, '/internal-users/roles', getInternalUsersRoles as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_READ'),
  postInternalUsersRoles: routePropertiesCore(POST, '/internal-users/:user_id/roles', postInternalUsersRoles as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_WRITE'),
  putInternalUsersRoles: routePropertiesCore(PUT, '/internal-users/:user_id/roles', putInternalUsersRoles as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_WRITE'),
  deleteInternalUsersRoles: routePropertiesCore(DELETE, '/internal-users/:user_id/roles', deleteInternalUsersRoles as RouteHandlerMethod, 'INTERNAL_USERS_AUTHORIZE_WRITE'),
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
