import fp from 'fastify-plugin';

import { createAuthenticationRepository } from '#repositories/authentication/authentication.repository';
import { createHealthRepository } from '#repositories/health/health.repository';
import { createInternalUsersRepository } from '#repositories/internal-users/internal-users.repository';
import { createPermissionsRepository } from '#repositories/permissions/permissions.repository';
import { createRolesRepository } from '#repositories/roles/roles.repository';
import { createRolePermissionsRepository } from '#repositories/roles-permissions/roles-permissions.repository';
import { createUsersRolesRepository } from '#repositories/users-roles/users-roles.repository';

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

function repositoriesPlugin(fastify: FastifyInstance, _options: FastifyPluginOptions): void {
  // Bind db into each repository factory so services receive a plain object with no db dependency.
  // Requires postgresPlugin to be registered first so fastify.db is available.
  if (!fastify.hasDecorator('db')) {
    throw new Error('repositoriesPlugin requires fastify.db. Ensure postgres-plugin is registered before repositories-plugin.');
  }

  fastify.decorate('repositories', {
    authentication: createAuthenticationRepository(fastify.db),
    health: createHealthRepository(fastify.db),
    internalUsers: createInternalUsersRepository(fastify.db),
    permissions: createPermissionsRepository(fastify.db),
    roles: createRolesRepository(fastify.db),
    rolePermissions: createRolePermissionsRepository(fastify.db),
    usersRoles: createUsersRolesRepository(fastify.db),
  });
}

// fp() breaks Fastify's encapsulation so this.repositories is visible across all scopes.
export default fp(repositoriesPlugin, {
  name: 'repositories-plugin',
  dependencies: ['postgres-plugin'],
  decorators: {
    fastify: ['db'],
  },
});
