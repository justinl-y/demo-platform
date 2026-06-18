import type {
  DatabaseDecorator,
} from './database.ts';

import type {
  JwtUser,
} from './jwt.ts';

import type { AuthenticationRepository } from '#repositories/authentication/authentication.repository';
import type { HealthRepository } from '#repositories/health/health.repository';
import type { UsersRepository } from '#repositories/users/users.repository';
import type { PermissionsRepository } from '#repositories/permissions/permissions.repository';
import type { RolesRepository } from '#repositories/roles/roles.repository';
import type { RolePermissionsRepository } from '#repositories/roles-permissions/roles-permissions.repository';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser | undefined;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseDecorator;
    repositories: {
      authentication: AuthenticationRepository;
      health: HealthRepository;
      users: UsersRepository;
      permissions: PermissionsRepository;
      roles: RolesRepository;
      rolePermissions: RolePermissionsRepository;
    };
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyContextConfig {
    permission?: string;
  }

  interface FastifyRequest {
    user: import('@fastify/jwt').FastifyJWT['user'];
  }

  interface FastifyReply {
    error?: unknown;
  }
}

export {};
