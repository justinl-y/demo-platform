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

async function authenticateOnRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const decodedToken: VerifyPayloadTypeCustom = await request.jwtVerify();

    if (decodedToken.type !== 'access') throw new UnauthorizedError('Incorrect authorization token type');
  }
  catch (err) {
    console.log(err);

    throw new UnauthorizedError('Authentication failed');
  }
};

export default authenticateOnRequest;
