// import { UnauthorizedError } from 'http-errors-enhanced';
// import { Config } from '#config/index';
// import { refresh } from '#services/auth/auth.service';

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

interface Request {
  params: {
    userId: string;
  };
}

async function putLogout(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const { params: { userId } } = request as Request;

  console.log(userId);

  return reply
    .code(204)
    .send()
  ;
}

export default putLogout;
