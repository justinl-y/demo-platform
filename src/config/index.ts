import {
  apiEnv,
  cors,
  compress,
  externalPort,
  fastify,
  helmet,
  server,
  user,
} from './api.js';
import {
  auth,
} from './auth.js';
import {
  aws,
} from './aws.js';
import {
  postgres,
} from './postgres.js';

if (!apiEnv) {
  console.log('Exiting: No api environment variable set...');

  process.exit(1);
}

export {
  apiEnv,
  auth,
  aws,
  compress,
  cors,
  externalPort,
  helmet,
  fastify,
  postgres,
  server,
  user,
};
