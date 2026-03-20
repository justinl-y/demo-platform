import { externalPort } from '../config/index.js';

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
