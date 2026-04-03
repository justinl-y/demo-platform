import type { FastifyInstance } from 'fastify';

import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import onRequest from './on-request.ts';
import preHandlers from './pre-handlers.ts';
import getUsers from './get-users/index.ts';

const { GET } = HTTP_METHODS;

const routes = {
  getUsers: routePropertiesCore(GET, '/users', getUsers),
};

export type UsersRouteKey = keyof typeof routes;

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<UsersRouteKey>).forEach((key) => {
    const value = routes[key];

    instance.route({ ...value, ...schema[key], ...onRequest.call(instance, key), ...preHandlers.call(instance, key) });
  });
};
