import {
  httpMethods,
} from '#utils/constants';
import {
  routePropertiesCore,
} from '#utils/functions';
import schema from './schema.ts';
import onRequest from './on-request.ts';
import postLogin from './post-login/index.ts';
import postRefresh from './post-refresh/index.ts';
import postLogout from './post-logout/index.ts';
import postPasswordForgot from './post-password-forgot/index.ts';
import postPasswordReset from './post-password-reset/index.ts';
import getMe from './get-me/index.ts';

import type {
  FastifyInstance,
  RouteHandlerMethod,
} from 'fastify';

const {
  GET,
  POST,
} = httpMethods;

const routes = {
  postLogin: routePropertiesCore(POST, '/login', postLogin as RouteHandlerMethod),
  postRefresh: routePropertiesCore(POST, '/refresh', postRefresh),
  postLogout: routePropertiesCore(POST, '/logout', postLogout),
  postPasswordForgot: routePropertiesCore(POST, '/password/forgot', postPasswordForgot as RouteHandlerMethod),
  postPasswordReset: routePropertiesCore(POST, '/password/reset', postPasswordReset as RouteHandlerMethod),
  getMe: routePropertiesCore(GET, '/me', getMe as RouteHandlerMethod),
};

export type RouteKey = keyof typeof routes;

export default (instance: FastifyInstance) => {
  (Object.keys(routes) as Array<RouteKey>).forEach((key) => {
    const value = routes[key];

    instance.route({
      ...value,
      ...schema[key],
      ...onRequest.call(instance, key),
    });
  });
};
