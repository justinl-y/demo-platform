import { routePropertiesPrehandler } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

// authorization goes in preHandler

function preHandler(this: FastifyInstance, key: RouteKey) {
  const routePreHandler = {
    getUsers: routePropertiesPrehandler([]),
    postUsers: routePropertiesPrehandler([]),
    deleteUsers: routePropertiesPrehandler([]),
    putUsers: routePropertiesPrehandler([]),
    patchUsersDeactivate: routePropertiesPrehandler([]),
  };

  return routePreHandler[key] ?? {};
}

export default preHandler;
