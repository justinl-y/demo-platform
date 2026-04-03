import type { FastifyInstance } from 'fastify';

import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import postLogin from './post-login/index.ts';

const { POST } = HTTP_METHODS;

const routes = {
  postLogin: routePropertiesCore(POST, '/login', postLogin),
};

export type UsersRouteKey = keyof typeof routes;

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<UsersRouteKey>).forEach((key) => {
    const value = routes[key];

    instance.route({ ...value, ...schema[key] });
  });
};
