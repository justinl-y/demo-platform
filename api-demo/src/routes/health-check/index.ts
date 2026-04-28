import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import getHealthDB from './get-health-db/index.ts';
import getHealthEB from './get-health-eb/index.ts';

import type { FastifyInstance } from 'fastify';

const { GET } = HTTP_METHODS;

const routes = {
  getHealthDB: routePropertiesCore(GET, '/health_db', getHealthDB),
  getHealthEB: routePropertiesCore(GET, '/health_eb', getHealthEB),
};

export type HealthCheckRouteKey = keyof typeof routes;

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<HealthCheckRouteKey>).forEach((key) => {
    const value = routes[key];

    instance.route({
      ...value,
      ...schema[key],
    });
  });
};
