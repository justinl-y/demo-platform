import { routePropertiesPrehandler } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function preHandler(this: FastifyInstance, key: RouteKey) {
  const routePreHandler = {
    getInternalUsers: routePropertiesPrehandler([this.authorize]),
    getInternalUsersRoles: routePropertiesPrehandler([this.authorize]),
    postInternalUsersRoles: routePropertiesPrehandler([this.authorize]),
    putInternalUsersRoles: routePropertiesPrehandler([this.authorize]),
    deleteInternalUsersRoles: routePropertiesPrehandler([this.authorize]),
    postInternalUsers: routePropertiesPrehandler([this.authorize]),
    putInternalUsers: routePropertiesPrehandler([this.authorize]),
    patchInternalUsersEmail: routePropertiesPrehandler([this.authorize]),
    deleteInternalUsers: routePropertiesPrehandler([this.authorize]),
    postInternalUsersActivate: routePropertiesPrehandler([]),
    patchInternalUsersInvite: routePropertiesPrehandler([this.authorize]),
    deleteInternalUsersInvite: routePropertiesPrehandler([this.authorize]),
    patchInternalUsersDeactivate: routePropertiesPrehandler([this.authorize]),
  };

  return routePreHandler[key] ?? {};
}

export default preHandler;
