import {
  apiEnv,
  cors,
  compress,
  externalPort,
  helmet,
  server,
  user,
} from './api.ts';
import {
  auth,
} from './auth.ts';
import {
  aws,
} from './aws.ts';
import {
  postgres,
} from './postgres.ts';

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
  postgres,
  server,
  user,
};
