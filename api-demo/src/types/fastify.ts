import type {
  DatabaseDecorator,
} from './database.ts';

import type {
  JwtUser,
} from './jwt.ts';

import type { AuthenticationRepository } from '#repositories/authentication/authentication.repository';
import type { HealthRepository } from '#repositories/health/health.repository';
import type { InternalUsersRepository } from '#repositories/internal-users/internal-users.repository';
import type { PermissionsRepository } from '#repositories/permissions/permissions.repository';
import type { RolesRepository } from '#repositories/roles/roles.repository';
import type { RolePermissionsRepository } from '#repositories/roles-permissions/roles-permissions.repository';
import type { UsersRolesRepository } from '#repositories/users-roles/users-roles.repository';

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
      internalUsers: InternalUsersRepository;
      permissions: PermissionsRepository;
      roles: RolesRepository;
      rolePermissions: RolePermissionsRepository;
      usersRoles: UsersRolesRepository;
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
