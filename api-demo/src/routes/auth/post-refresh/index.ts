import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  cwd,
} from '#utils/functions';

import {
  bcryptCompare,
  cookieOptions,
  generateJwt,
} from '#utils/authentication';
import {
  Config,
} from '#config/index';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

import type {
  JwtUser,
} from '../../../types/jwt.ts';

import type {
  IAuthPostRefreshGetUserWithRefreshTokenResult,
} from './types/get-user-with-refresh-token.typed.queries.ts';

const relPath = import.meta.dirname;

async function postRefresh(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    accessTokenCookie,
    accessTokenCookieMaxAge,
    accessTokenJwt,
    refreshTokenCookie,
    refreshTokenJwt,
  } = Config.authConfig();

  const tokenRefresh = request.cookies[refreshTokenCookie];
  if (!tokenRefresh) throw new UnauthorizedError('Authentication failed');

  let decodedToken: JwtUser;

  try {
    // check for valid token and token type - if not throw
    decodedToken = this.jwt.verify(tokenRefresh);
  }
  catch (err) {
    request.log.error(err instanceof Error ? (err.stack ?? err.message) : String(err));

    throw new UnauthorizedError('Authentication failed');
  }

  const {
    id: userId,
    email: userEmail,
    type: tokenType,
  } = decodedToken;

  if (tokenType !== refreshTokenJwt) throw new UnauthorizedError('Incorrect authorization token type');

  // get hashed refresh token if existing - if not throw
  const user = await this.db.query<IAuthPostRefreshGetUserWithRefreshTokenResult>(cwd('get-user-with-refresh-token', relPath), { userId }, 'one');
  if (!user) throw new UnauthorizedError('Authentication failed');

  const {
    token_refresh_hash: tokenRefreshHash,
  } = user;

  // compare tokenRefreshHash to incoming token - if not the same throw
  const validRefreshToken = await bcryptCompare(tokenRefresh, tokenRefreshHash);
  if (!validRefreshToken) throw new UnauthorizedError('Authentication failed');

  // issue a new access token cookie
  const tokenAccess = generateJwt.call(this, userId, userEmail, accessTokenJwt);

  reply.setCookie(accessTokenCookie, tokenAccess, { ...cookieOptions, maxAge: accessTokenCookieMaxAge });

  reply
    .code(204)
    .send()
  ;
}

export default postRefresh;
