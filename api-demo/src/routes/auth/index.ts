import {
  HTTP_METHODS,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import postLogin from './post-login/index.ts';
import postRefresh from './post-refresh/index.ts';
import postLogout from './post-logout/index.ts';

import type {
  FastifyInstance,
  RouteHandlerMethod,
} from 'fastify';

const {
  POST,
} = HTTP_METHODS;

const routes = {
  postLogin: routePropertiesCore(POST, '/login', postLogin as RouteHandlerMethod),
  postRefresh: routePropertiesCore(POST, '/refresh', postRefresh),
  postLogout: routePropertiesCore(POST, '/logout', postLogout),
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
