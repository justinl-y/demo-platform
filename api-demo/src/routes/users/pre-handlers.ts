import { routePropertiesPrehandler } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function onRequest(this: FastifyInstance, key: RouteKey) {
  const routePreHander = {
    getUsers: routePropertiesPrehandler([]),
  };

  return routePreHander[key] ?? {};
}

export default onRequest;
