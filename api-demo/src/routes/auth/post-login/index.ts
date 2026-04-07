import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  cwd,
} from '#utils/functions';

import {
  bcryptCompare,
  bcryptHash,
  generateJwt,
} from '#utils/authentication';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

type Request = {
  body: {
    email: string;
    password: string;
  };
};

type UserRow = {
  id: string;
  full_name: string;
  known_as: string;
  password_hash: string;
};

const relPath = import.meta.dirname;
const error = new UnauthorizedError('Authentication failed');

async function postLogin(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    body: {
      email: userEmail,
      password: incomingPassword,
    },
  } = request as Request;

  // get email + hashed password from db - if nothing throw
  const user = await this.db.query<UserRow>(cwd('get-user', relPath), { email: userEmail }, 'one');
  if (!user) throw error;

  const {
    id: userId,
    full_name: fullName,
    known_as: knownAs,
    password_hash: passwordHash,
  } = user;

  // bcrypt compare incoming password with hashed password - if not a match throw
  const compare = await bcryptCompare(incomingPassword, passwordHash);
  if (!compare) throw error;

  // generate jwts
  const tokenAccess = generateJwt.call(this, userId, userEmail, 'access');
  const tokenRefresh = generateJwt.call(this, userId, userEmail, 'refresh');

  // hash tokenRefresh
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

  const response = {
    id: userId,
    email: userEmail,
    full_name: fullName,
    known_as: knownAs,
    token_access: tokenAccess,
    token_refresh: tokenRefresh,
  };

  reply
    .send(response);

  return reply;
}

export default postLogin;
