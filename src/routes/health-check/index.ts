import type { FastifyInstance } from 'fastify';

import {
  HTTP_METHODS,
} from '../../util/constants.ts';
import {
  routePropertiesCore,
} from '../../util/functions/functions.ts';
import schema from './schema.ts';
import getHealthEB from './getHealthEB/getHealthEB.ts';
// import getHealthDB from './getHealthDB/getHealthDB.ts';

const { GET } = HTTP_METHODS;

const routes = {
  getHealthEB: routePropertiesCore(GET, '/health_eb', getHealthEB),
  // getHealthDB: routePropertiesCore(GET, '/health_db', getHealthDB),
};

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<keyof typeof routes>).forEach((key) => {
    const value = routes[key];

    instance.route({ ...value, schema: schema[key] });
  });
};
