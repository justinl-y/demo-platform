import type {
  DatabaseDecorator,
} from './database.ts';

import type {
  JwtUser,
} from './jwt.ts';

import type { AuthRepository } from '#repositories/auth/auth.repository';
import type { HealthRepository } from '#repositories/health/health.repository';
import type { UsersRepository } from '#repositories/users/users.repository';

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
    repositories: {
      auth: AuthRepository;
      health: HealthRepository;
      users: UsersRepository;
    };
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export {};
