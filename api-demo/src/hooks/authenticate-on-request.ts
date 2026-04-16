import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import {
  Config,
} from '#config/index';

import { setSentryUser } from '#utils/sentry-instrument';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import type {
  JwtUser,
} from '../types/jwt.ts';

async function authenticateOnRequest(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  let decodedToken: JwtUser;

  try {
    decodedToken = await request.jwtVerify();
  }
  catch (err) {
    throw new UnauthorizedError('Authentication failed');
  }

  const {
    accessTokenJwt,
  } = Config.authConfig();

  if (decodedToken.type !== accessTokenJwt) throw new UnauthorizedError('Incorrect authorization token type');

  setSentryUser({ id: decodedToken.id, email: decodedToken.email });
};

export default authenticateOnRequest;
