import { Config } from '#config/index';

const localHost = `http://localhost:${Config.externalPort}`;

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
