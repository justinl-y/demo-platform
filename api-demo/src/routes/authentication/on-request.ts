import { routePropertiesOnRequest } from '#utils/functions';

import type { FastifyInstance } from 'fastify';
import type { RouteKey } from './index.ts';

function onRequest(this: FastifyInstance, key: RouteKey) {
  const routeOnRequest = {
    postLogin: routePropertiesOnRequest([]),
    postRefresh: routePropertiesOnRequest([]),
    postLogout: routePropertiesOnRequest([]),
    postPasswordForgot: routePropertiesOnRequest([]),
    postPasswordReset: routePropertiesOnRequest([]),
    postPasswordResetValidate: routePropertiesOnRequest([]),
    getMe: routePropertiesOnRequest([this.authenticate]),
  };

  return routeOnRequest[key] ?? {};
}

export default onRequest;
