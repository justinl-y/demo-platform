import auth from './auth/index.ts';
import healthCheck from './health-check/index.ts';
import users from './users/index.ts';

export default [
  auth,
  healthCheck,
  users,
];
