import { cookieOptions } from '#lib/authentication';
import { Config } from '#config/index';
import { login } from '#services/auth/auth.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

type Request = {
  body: {
    email: string;
    password: string;
  };
};

async function postLogin(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    body: {
      email, password,
    },
  } = request as Request;

  const {
    accessTokenCookie, accessTokenCookieMaxAge, refreshTokenCookie, refreshTokenCookieMaxAge,
  } = Config.authConfig();

  const result = await login(this.db, this.jwt, email, password);

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

  reply.send(result.user);
}

export default postLogin;
