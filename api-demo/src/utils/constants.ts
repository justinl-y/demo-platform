import { Config } from '#config/index';

const localHost = `http://localhost:${Config.externalPort}`;

const httpMethods = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
} as const;

// Verified SES sender identity for transactional emails (e.g. invitations).
const defaultSenderEmailAddress = 'noreply@discovered-check.ca' as const;

// route definition here to allow for sharing across multiple services
const postUsersActivateRoute = '/users/activate' as const;

export {
  localHost,
  httpMethods,
  defaultSenderEmailAddress,
  postUsersActivateRoute,
};
