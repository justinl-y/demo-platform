import { BadRequestError } from 'http-errors-enhanced';
import { Config } from '#config/index';
import { logout } from '#services/auth/auth.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

async function putLogout(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    accessTokenCookie,
    refreshTokenCookie,
  } = Config.authConfig();

  const {
    cookies: {
      [refreshTokenCookie]: tokenRefresh,
    },
  } = request;

  if (!tokenRefresh) throw new BadRequestError('Refresh token required');

  await logout(this.db, this.jwt, tokenRefresh);

  // return 204 irrespective of an actual user or not
  return reply
    .clearCookie(accessTokenCookie, { path: '/' })
    .clearCookie(refreshTokenCookie, { path: '/' })
    .code(204)
    .send()
  ;
}

export default putLogout;
