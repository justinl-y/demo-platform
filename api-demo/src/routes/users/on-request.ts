import { routePropertiesOnRequest } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function onRequest(this: FastifyInstance, key: RouteKey) {
  const routeOnRequest = {
    getUsers: routePropertiesOnRequest([this.authenticate]),
  };

  return routeOnRequest[key] ?? {};
}

export default onRequest;
