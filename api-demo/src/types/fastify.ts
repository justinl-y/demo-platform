import type {
  DatabaseDecorator,
} from './database.ts';

import type {
  JwtUser,
} from './jwt.ts';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser | undefined;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: import('@fastify/jwt').FastifyJWT['user'];
  }

  interface FastifyReply {
    error?: unknown;
  }

  interface FastifyInstance {
    db: DatabaseDecorator;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export {};
