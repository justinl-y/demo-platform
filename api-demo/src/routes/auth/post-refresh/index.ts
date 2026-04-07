import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  CWD,
} from '#utils/functions';

import {
  generateJwt,
} from '#utils/authentication';

import type {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
} from 'fastify';

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

  // check for valid token
  try {
    this.jwt.verify(tokenRefresh);
  }
  catch (err) {
    console.log(err);

    throw error;
  }

  // check for token esistance
  type UserRow = {
    id: string;
    email: string;
  };

  const user = await this.db.query<UserRow>(CWD('get-user-by-refresh-token', relPath), { tokenRefresh }, 'one');
  if (!user) throw error;

  const {
    id: userId,
    email: userEmail,
  } = user;

  // if existing create a new access token
  const tokenAccess = generateJwt.call(this, userId, userEmail, 'access');

  const result = { token_access: tokenAccess };

  reply.send(result);

  return reply;
}

export default postRefresh;
