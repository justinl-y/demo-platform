import { routePropertiesOnRequest } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function onRequest(this: FastifyInstance, key: RouteKey) {
  const routeOnRequest = {
    getInternalUsers: routePropertiesOnRequest([this.authenticate]),
    getInternalUsersRoles: routePropertiesOnRequest([this.authenticate]),
    postInternalUsersRoles: routePropertiesOnRequest([this.authenticate]),
    putInternalUsersRoles: routePropertiesOnRequest([this.authenticate]),
    deleteInternalUsersRoles: routePropertiesOnRequest([this.authenticate]),
    postInternalUsers: routePropertiesOnRequest([this.authenticate]),
    putInternalUsers: routePropertiesOnRequest([this.authenticate]),
    patchInternalUsersEmail: routePropertiesOnRequest([this.authenticate]),
    deleteInternalUsers: routePropertiesOnRequest([this.authenticate]),
    postInternalUsersActivate: routePropertiesOnRequest([]),
    patchInternalUsersInvite: routePropertiesOnRequest([this.authenticate]),
    deleteInternalUsersInvite: routePropertiesOnRequest([this.authenticate]),
    patchInternalUsersDeactivate: routePropertiesOnRequest([this.authenticate]),
  };

  return routeOnRequest[key] ?? {};
}

export default onRequest;
