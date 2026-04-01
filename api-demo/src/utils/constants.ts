import { externalPort } from '#config/api';

const localHost = `http://localhost:${externalPort}`;

const HTTP_METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
} as const;

export {
  localHost,
  HTTP_METHODS,
};
