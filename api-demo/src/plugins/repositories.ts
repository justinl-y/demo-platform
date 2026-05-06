import fp from 'fastify-plugin';

import { createAuthRepository } from '#repositories/auth/auth.repository';
import { createHealthRepository } from '#repositories/health/health.repository';
import { createUsersRepository } from '#repositories/users/users.repository';

import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

function repositoriesPlugin(fastify: FastifyInstance, _options: FastifyPluginOptions): void {
  // Bind db into each repository factory so services receive a plain object with no db dependency.
  // Requires postgresPlugin to be registered first so fastify.db is available.
  if (!fastify.hasDecorator('db')) {
    throw new Error('repositoriesPlugin requires fastify.db. Ensure postgres-plugin is registered before repositories-plugin.');
  }

  fastify.decorate('repositories', {
    auth: createAuthRepository(fastify.db),
    health: createHealthRepository(fastify.db),
    users: createUsersRepository(fastify.db),
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
