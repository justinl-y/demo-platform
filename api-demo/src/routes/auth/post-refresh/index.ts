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

type Request = {
  body: {
    token_refresh: string;
  };
};

const relPath = import.meta.dirname;
const error = new UnauthorizedError('Authentication failed');

async function postRefresh(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const {
    body: {
      token_refresh: tokenRefresh,
    },
  } = request as Request;

  // check for valid token and token type - if not throw
  const decodedToken: VerifyPayloadTypeCustom = this.jwt.verify(tokenRefresh);

  const {
    id: userId,
    email: userEmail,
    type: tokenType,
  } = decodedToken;

  if (tokenType !== 'refresh') throw new UnauthorizedError('Incorrect authorization token type');

  type UserRow = {
    id: string;
    token_refresh_hash: string;
  };

  // get hashed access token if existing - if not throw
  const user = await this.db.query<UserRow>(cwd('get-user-with-refresh-token', relPath), { userId }, 'one');
  if (!user) throw error;

  const {
    token_refresh_hash: tokenRefreshHash,
  } = user;

  // compare tokenRefreshHash to incoming token - if not the same throw
  const validAccessTokem = await bcryptCompare(tokenRefresh, tokenRefreshHash);
  if (!validAccessTokem) throw error;

  // create a new access token
  const tokenAccess = generateJwt.call(this, userId, userEmail, 'access');

  const result = { token_access: tokenAccess };

  reply.send(result);

  return reply;
}

export default postRefresh;
