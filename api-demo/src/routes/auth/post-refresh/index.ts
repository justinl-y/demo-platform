import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  cwd,
} from '#utils/functions';

import {
  bcryptCompare,
  generateJwt,
} from '#utils/authentication';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

import type {
  VerifyPayloadTypeCustom,
} from '../../../types/jwt-payload.ts';

import type {
  IAuthPostRefreshGetUserWithRefreshTokenResult,
} from './types/get-user-with-refresh-token.typed.queries.ts';

const relPath = import.meta.dirname;

type Request = {
  Body: {
    token_refresh: string;
  };
};

async function postRefresh(this: FastifyInstance, request: FastifyRequest<Request>, reply: FastifyReply) {
  const {
    body: {
      token_refresh: tokenRefresh,
    },
  } = request;

  let decodedToken: VerifyPayloadTypeCustom;

  try {
    // check for valid token and token type - if not throw
    decodedToken = this.jwt.verify(tokenRefresh);
  }
  catch (err) {
    console.log(err);

    throw new UnauthorizedError('Authentication failed');
  }

  const {
    id: userId,
    email: userEmail,
    type: tokenType,
  } = decodedToken;

  if (tokenType !== 'refresh') throw new UnauthorizedError('Incorrect authorization token type');

  // get hashed access token if existing - if not throw
  const user = await this.db.query<IAuthPostRefreshGetUserWithRefreshTokenResult>(cwd('get-user-with-refresh-token', relPath), { userId }, 'one');
  if (!user) throw new UnauthorizedError('Authentication failed');

  const {
    token_refresh_hash: tokenRefreshHash,
  } = user;

  // compare tokenRefreshHash to incoming token - if not the same throw
  const validRefreshToken = await bcryptCompare(tokenRefresh, tokenRefreshHash);
  if (!validRefreshToken) throw new UnauthorizedError('Authentication failed');

  // create a new access token
  const tokenAccess = generateJwt.call(this, userId, userEmail, 'access');

  const result = { token_access: tokenAccess };

  reply.send(result);

  return reply;
}

export default postRefresh;
