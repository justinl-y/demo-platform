import { FastifyInstance } from 'fastify';

import {
  HTTP_METHODS,
} from '../../util/constants.js';
import {
  routePropertiesCore,
} from '../../util/functions/functions.js';
import schema from './schema.js';
import getHealthEB from './getHealthEB/getHealthEB.js';
// import getHealthDB from './getHealthDB/getHealthDB.js';

const { GET } = HTTP_METHODS;

const routes = {
  getHealthEB: routePropertiesCore(GET, '/health_eb', getHealthEB),
  // getHealthDB: routePropertiesCore(GET, '/health_db', getHealthDB),
};

export default (instance: FastifyInstance) => {
  Object.entries(routes).forEach(([key, value]) => instance.route({ ...value, schema: schema[key] }));
};
