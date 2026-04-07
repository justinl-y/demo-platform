import {
  UnauthorizedError,
} from 'http-errors-enhanced';

import type {
  FastifyRequest,
  FastifyReply,
} from 'fastify';

import type { VerifyPayloadType } from '@fastify/jwt';

type VerifyPayloadTypeCustom = VerifyPayloadType & { type: string };

async function authenticateOnRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const decodedToken: VerifyPayloadTypeCustom = await request.jwtVerify();

    if (decodedToken.type !== 'access') throw new UnauthorizedError('Authentication failed');
  }
  catch (err) {
    reply.send(err);
  }
};

export default authenticateOnRequest;
