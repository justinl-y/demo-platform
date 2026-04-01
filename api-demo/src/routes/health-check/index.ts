import type { FastifyInstance } from 'fastify';

import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions/functions';
import schema from './schema.ts';
import getHealthDB from './getHealthDB/getHealthDB.ts';
import getHealthEB from './getHealthEB/getHealthEB.ts';

const { GET } = HTTP_METHODS;

const routes = {
  getHealthDB: routePropertiesCore(GET, '/health_db', getHealthDB),
  getHealthEB: routePropertiesCore(GET, '/health_eb', getHealthEB),
};

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<keyof typeof routes>).forEach((key) => {
    const value = routes[key];

    instance.route({ ...value, schema: schema[key] });
  });
};
