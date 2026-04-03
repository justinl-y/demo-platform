import request from 'supertest';

import { BASE_REQUEST } from './constants.ts';

import type Supertest from 'supertest';

const app = request(BASE_REQUEST);

type ApiMethod = 'get' | 'put' | 'patch' | 'del' | 'post';

type RequestBody = Record<string, unknown>;

type RequestHeaders = Record<string, string>;

type ApiRequest = (
  resource: string,
  data?: RequestBody,
  headers?: RequestHeaders,
) => Promise<Supertest.Response>;

type ApiClient = Record<ApiMethod, ApiRequest>;

async function userLogin() {
  const result = await app
    .post('/users/login')
    .send({
      email: 'user.super@email.com',
      password: 'user.super@email.com',
    })
    .set('Accept', 'application/json')
  ;

  return result.body.token;
};

const bearerToken = await userLogin();

const methods: ApiMethod[] = ['get', 'put', 'patch', 'del', 'post'];
const requestByMethod: Record<ApiMethod, (resource: string) => Supertest.Test> = {
  get: (resource) => app.get(resource),
  put: (resource) => app.put(resource),
  patch: (resource) => app.patch(resource),
  del: (resource) => app.delete(resource),
  post: (resource) => app.post(resource),
};
const authAPI = {} as ApiClient;
const noAuthAPI = {} as ApiClient;

// loop over all the http methods (get, post, put, delete and patch) and return functions for each.
// also do error checking for 500s and immediately terminate test suite.
methods.forEach((method) => {
  // Return a pre-configured Supertest request with authorization headers
  authAPI[method] = async (resource, data = {}, headers = {}) => {
    const rep = await requestByMethod[method](resource)
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(data)
      .set(headers)
      .set('Accept', 'application/json');

    if (rep.status === 500) {
      console.log('SERVER RESPONDED WITH a 500 Status. You should investigate this. Abandoning Tests.');
      console.log(JSON.stringify(rep.body));
      process.exit(1);
    }
    else {
      return rep;
    }
  };
  noAuthAPI[method] = async (resource, data = {}, headers = {}) => {
    const rep = await requestByMethod[method](resource)
      .send(data)
      .set(headers)
      .set('Accept', 'application/json');

    if (rep.status === 500) {
      console.log('SERVER RESPONDED WITH a 500 Status. You should investigate this. Abandoning Tests.');
      console.log(JSON.stringify(rep.body));
      process.exit(1);
    }
    else {
      return rep;
    }
  };
});

export {
  authAPI,
  noAuthAPI,
};
