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
import getRoles from './get-roles/index.ts';
import postRoles from './post-roles/index.ts';
import putRoles from './put-roles/index.ts';
import deleteRoles from './delete-roles/index.ts';
import getRolePermissions from './get-roles-permissions/index.ts';
import postRolePermissions from './post-roles-permissions/index.ts';
import putRolePermissions from './put-roles-permissions/index.ts';
import deleteRolePermissions from './delete-roles-permissions/index.ts';

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
  getRoles: routePropertiesCore(GET, '/roles', getRoles as RouteHandlerMethod, 'INTERNAL_ROLES_READ'),
  postRoles: routePropertiesCore(POST, '/roles', postRoles as RouteHandlerMethod, 'INTERNAL_ROLES_WRITE'),
  putRoles: routePropertiesCore(PUT, '/roles/:role_id', putRoles as RouteHandlerMethod, 'INTERNAL_ROLES_WRITE'),
  deleteRoles: routePropertiesCore(DELETE, '/roles/:role_id', deleteRoles as RouteHandlerMethod, 'INTERNAL_ROLES_WRITE'),
  getRolePermissions: routePropertiesCore(GET, '/roles/permissions', getRolePermissions as RouteHandlerMethod, 'INTERNAL_ROLES_READ'),
  postRolePermissions: routePropertiesCore(POST, '/roles/:role_id/permissions', postRolePermissions as RouteHandlerMethod, 'INTERNAL_ROLES_WRITE'),
  putRolePermissions: routePropertiesCore(PUT, '/roles/:role_id/permissions', putRolePermissions as RouteHandlerMethod, 'INTERNAL_ROLES_WRITE'),
  deleteRolePermissions: routePropertiesCore(DELETE, '/roles/:role_id/permissions', deleteRolePermissions as RouteHandlerMethod, 'INTERNAL_ROLES_WRITE'),
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
