import { routePropertiesOnRequest } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function onRequest(this: FastifyInstance, key: RouteKey) {
  const routeOnRequest = {
    getPermissions: routePropertiesOnRequest([this.authenticate]),
    postPermissions: routePropertiesOnRequest([this.authenticate]),
    putPermissions: routePropertiesOnRequest([this.authenticate]),
    deletePermissions: routePropertiesOnRequest([this.authenticate]),
    getRoles: routePropertiesOnRequest([this.authenticate]),
    postRoles: routePropertiesOnRequest([this.authenticate]),
    putRoles: routePropertiesOnRequest([this.authenticate]),
    deleteRoles: routePropertiesOnRequest([this.authenticate]),
    getRolePermissions: routePropertiesOnRequest([this.authenticate]),
    postRolePermissions: routePropertiesOnRequest([this.authenticate]),
    putRolePermissions: routePropertiesOnRequest([this.authenticate]),
    deleteRolePermissions: routePropertiesOnRequest([this.authenticate]),
  };

  return routeOnRequest[key] ?? {};
}

export default onRequest;
