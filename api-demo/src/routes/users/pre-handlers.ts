import { routePropertiesPrehandler } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function preHandler(this: FastifyInstance, key: RouteKey) {
  const routePreHandler = {
    getUsers: routePropertiesPrehandler([this.authorize]),
    getUsersRoles: routePropertiesPrehandler([this.authorize]),
    postUsersRoles: routePropertiesPrehandler([this.authorize]),
    putUsersRoles: routePropertiesPrehandler([this.authorize]),
    deleteUsersRoles: routePropertiesPrehandler([this.authorize]),
    postUsers: routePropertiesPrehandler([this.authorize]),
    putUsers: routePropertiesPrehandler([this.authorize]),
    patchUsersEmail: routePropertiesPrehandler([this.authorize]),
    deleteUsers: routePropertiesPrehandler([this.authorize]),
    postUsersActivate: routePropertiesPrehandler([]),
    patchUsersInvite: routePropertiesPrehandler([this.authorize]),
    deleteUsersInvite: routePropertiesPrehandler([this.authorize]),
    patchUsersDeactivate: routePropertiesPrehandler([this.authorize]),
  };

  return routePreHandler[key] ?? {};
}

export default preHandler;
