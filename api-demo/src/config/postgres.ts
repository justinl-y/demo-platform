import os from 'os';
import { secretValues } from '#utils/secrets-manager';
import { apiEnv } from './api.ts';

const numberCPUs = os.cpus().length;
const POOL_SIZE_PER_CPU = 4;
const maxPoolSize = numberCPUs * POOL_SIZE_PER_CPU;

function postgresConfig() {
  return {
    host: secretValues.PG_HOST,
    port: 5432,
    database: secretValues.PG_DATABASE,
    user: secretValues.PG_ROLE,
    password: secretValues.PG_PASSWORD,
    ssl: apiEnv === 'TEST'
      ? {
          require: false,
          rejectUnauthorized: false,
        }
      : {
          require: true,
          ca: secretValues.PG_SSL_CERT,
          rejectUnauthorized: true,
        },
    max: maxPoolSize,
    idleTimeoutMillis: 10000,
  };
}

export {
  postgresConfig,
};
