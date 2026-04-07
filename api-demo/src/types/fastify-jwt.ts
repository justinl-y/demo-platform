import type {
  DatabaseDecorator,
} from './database.ts';
import type {
  JwtUser,
} from './auth.ts';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseDecorator;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user: import('@fastify/jwt').FastifyJWT['user'];
  }

  interface FastifyReply {
    error?: unknown;
  }
}

export {};
