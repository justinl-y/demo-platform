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
  IAuthPostLoginGetUserResult,
} from './types/get-user.typed.queries.ts';

const relPath = import.meta.dirname;

type Request = {
  body: {
    email: string;
    password: string;
  };
};

async function postLogin(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    body: {
      email: userEmail,
      password: incomingPassword,
    },
  } = request as Request;

  // get email + hashed password from db - if nothing throw
  const user = await this.db.query<IAuthPostLoginGetUserResult>(cwd('get-user', relPath), { email: userEmail }, 'one');
  if (!user) throw new UnauthorizedError('Authentication failed');

  const {
    id: userId,
    full_name: fullName,
    known_as: knownAs,
    password_hash: passwordHash,
  } = user;

  const {
    accessTokenCookie,
    accessTokenJwt,
    accessTokenCookieMaxAge,
    refreshTokenCookie,
    refreshTokenJwt,
    refreshTokenCookieMaxAge,
  } = Config.authConfig();

  const tokenRefresh = generateJwt(this, userId, userEmail, refreshTokenJwt);

  const [
    tokenAccess,
    validPassword,
  ] = await Promise.all([
    generateJwt(this, userId, userEmail, accessTokenJwt),
    bcryptCompare(incomingPassword, passwordHash),
  ]);

  // bcrypt compare incoming password with hashed password - if not a match throw
  if (!validPassword) throw new UnauthorizedError('Authentication failed');

  const hashedTokenRefresh = await bcryptHash(tokenRefresh);

  // save hashedTokenRefresh to db and set last_login to now
  const statements = [
    {
      files: [
        cwd('set-user-token', relPath),
      ],
      params: { hashedTokenRefresh, userId },
    },
  ];

  await this.db.transaction(statements);

  reply.setCookie(accessTokenCookie, tokenAccess, { ...cookieOptions, maxAge: accessTokenCookieMaxAge });
  reply.setCookie(refreshTokenCookie, tokenRefresh, { ...cookieOptions, maxAge: refreshTokenCookieMaxAge });

  reply.send({
    id: userId,
    email: userEmail,
    full_name: fullName,
    known_as: knownAs,
  });
}

export default postLogin;
