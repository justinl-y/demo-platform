import { cookieOptions } from '#lib/authentication';
import { Config } from '#config/index';
import { login } from '#services/authentication/authentication.service';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

import type { Login } from '#shared/types';

type Request = {
  Body: Login;
};

async function postLogin(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      email,
      password,
    },
  } = request;

  const {
    accessTokenCookie, accessTokenCookieMaxAge, refreshTokenCookie, refreshTokenCookieMaxAge,
  } = Config.authConfig();

  const loginParams = {
    email,
    password,
  };

  const result = await login(this.repositories.authentication, this.jwt, loginParams);

  // access cookie
  reply.setCookie(accessTokenCookie, result.accessToken, {
    ...cookieOptions,
    maxAge: accessTokenCookieMaxAge,
  });

  // refresh cookie
  reply.setCookie(refreshTokenCookie, result.refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenCookieMaxAge,
  });

  return reply.send(result.user);
}

export default postLogin;
