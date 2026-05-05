import cookiePlugin from './cookie.ts';
import jwtPlugin from './jwt.ts';
import postgresPlugin from './postgres.ts';
import repositoriesPlugin from './repositories.ts';

// postgresPlugin to be registered first so fastify.db is available for repositoriesPlugin
export default [
  cookiePlugin,
  jwtPlugin,
  postgresPlugin,
  repositoriesPlugin,
];
