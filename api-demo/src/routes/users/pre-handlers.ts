import { routePropertiesPrehandler } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { UsersRouteKey } from './index.ts';

type RouteKey = UsersRouteKey;

function onRequest(this: FastifyInstance, key: RouteKey) {
  const routePreHander = {
    getUsers: routePropertiesPrehandler([]),
  };

  return routePreHander[key] ?? {};
}

export default onRequest;
