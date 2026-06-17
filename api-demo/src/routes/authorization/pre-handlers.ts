import { routePropertiesPrehandler } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

// authorization goes in preHandler

function preHandler(this: FastifyInstance, key: RouteKey) {
  const routePreHandler = {
    getPermissions: routePropertiesPrehandler([this.authorize]),
    postPermissions: routePropertiesPrehandler([this.authorize]),
    putPermissions: routePropertiesPrehandler([this.authorize]),
    deletePermissions: routePropertiesPrehandler([this.authorize]),
  };

  return routePreHandler[key] ?? {};
}

export default preHandler;
