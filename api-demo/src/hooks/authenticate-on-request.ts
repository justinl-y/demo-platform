import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import type {
  VerifyPayloadTypeCustom,
} from '../types/jwt-payload.ts';

async function authenticateOnRequest(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  let decodedToken: VerifyPayloadTypeCustom;

  try {
    decodedToken = await request.jwtVerify();
  }
  catch (err) {
    throw new UnauthorizedError('Authentication failed');
  }

  if (decodedToken.type !== 'access') throw new UnauthorizedError('Incorrect authorization token type');
};

export default authenticateOnRequest;
