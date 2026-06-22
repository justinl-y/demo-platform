import authentication from './authentication/index.ts';
import authorization from './authorization/index.ts';
import healthCheck from './health-check/index.ts';
import users from './users/index.ts';

export default [
  authentication,
  authorization,
  healthCheck,
  users,
];
