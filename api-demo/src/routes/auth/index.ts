import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import postLogin from './post-login/index.ts';
import postRefresh from './post-refresh/index.ts';
import putLogout from './put-logout/index.ts';

import type { FastifyInstance } from 'fastify';

const {
  POST, PUT,
} = HTTP_METHODS;

const routes = {
  postLogin: routePropertiesCore(POST, '/login', postLogin),
  postRefresh: routePropertiesCore(POST, '/refresh', postRefresh),
  putLogout: routePropertiesCore(PUT, '/logout/:userId', putLogout),
};

export type RouteKey = keyof typeof routes;

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<RouteKey>).forEach((key) => {
    const value = routes[key];

    instance.route({
      ...value,
      ...schema[key],
    });
  });
};
