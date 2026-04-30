import { UnauthorizedError } from 'http-errors-enhanced';
import { cookieOptions } from '#lib/authentication';
import { Config } from '#config/index';
import { refresh } from '#services/auth/auth.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

async function postRefresh(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    accessTokenCookie, accessTokenCookieMaxAge, refreshTokenCookie, refreshTokenCookieMaxAge,
  } = Config.authConfig();

  const { cookies: { [refreshTokenCookie]: tokenRefresh } } = request;

  if (!tokenRefresh) throw new UnauthorizedError('Authentication failed');

  const result = await refresh(this.db, this.jwt, tokenRefresh);

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

  return reply
    .code(204)
    .send()
  ;
}

export default postRefresh;
