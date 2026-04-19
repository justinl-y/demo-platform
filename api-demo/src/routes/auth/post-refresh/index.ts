import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  cwd,
} from '#utils/functions';

import {
  bcryptCompare,
  bcryptHash,
  cookieOptions,
  generateJwt,
} from '#lib/authentication';
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
const getUserByTokenQuery = cwd('get-user-with-refresh-token', relPath);
const setUserTokenQuery = cwd('set-user-token', relPath);

async function postRefresh(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    accessTokenCookie,
    accessTokenCookieMaxAge,
    accessTokenJwt,
    refreshTokenCookie,
    refreshTokenJwt,
    refreshTokenCookieMaxAge,
  } = Config.authConfig();

  const {
    cookies: { [refreshTokenCookie]: tokenRefresh },
  } = request;

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
  const user = await this.db.query<IAuthPostRefreshGetUserWithRefreshTokenResult>(getUserByTokenQuery, { userId }, 'one');
  if (!user) throw new UnauthorizedError('Authentication failed');

  const {
    token_refresh_hash: tokenRefreshHash,
  } = user;

  const [
    validRefreshToken,
    tokenAccess,
  ] = await Promise.all([
    bcryptCompare(tokenRefresh, tokenRefreshHash),
    generateJwt(this, userId, userEmail, accessTokenJwt),
  ]);

  // compare tokenRefreshHash to incoming token - if not the same throw
  if (!validRefreshToken) throw new UnauthorizedError('Authentication failed');

  // create and persist a fresh refresh token
  const hashedTokenRefresh = await bcryptHash(tokenRefresh);

  // save hashedTokenRefresh to db
  const statements = [
    {
      files: [setUserTokenQuery],
      params: { hashedTokenRefresh, userId },
    },
  ];

  await this.db.transaction(statements);

  // issue a new access token cookie
  reply.setCookie(accessTokenCookie, tokenAccess, { ...cookieOptions, maxAge: accessTokenCookieMaxAge });
  reply.setCookie(refreshTokenCookie, tokenRefresh, { ...cookieOptions, maxAge: refreshTokenCookieMaxAge });

  reply
    .code(204)
    .send()
  ;
}

export default postRefresh;
