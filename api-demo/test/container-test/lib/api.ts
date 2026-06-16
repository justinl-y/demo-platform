import request from 'supertest';

import { BASE_REQUEST } from './constants.ts';
import { query } from './db.ts';
import { generateTestCookie } from './functions.ts';

import type Supertest from 'supertest';

// Build an access-token cookie for a seeded user, populated with that user's
// real permissions (so authorization behaves exactly as in production).
async function getAccessTokenCookieForEmail(email: string): Promise<string> {
  const getUserSql = `SELECT
    u.id
  FROM
    internal.users AS u
  WHERE
    u.email = $1;`
  ;
  const [row] = await query<{ id: string }>(getUserSql, [email]);

  if (!row) throw new Error(`getAccessTokenCookieForEmail: user not found (${email})`);

  const getUserPermissionSql = `SELECT
    p.name
  FROM
    internal.users_roles AS ur
    INNER JOIN internal.role_permissions AS rp ON rp.role_id = ur.role_id
    INNER JOIN internal.permissions AS p ON p.id = rp.permission_id
  WHERE
    ur.user_id = $1;`
  ;
  const permissionRows = await query<{ name: string }>(getUserPermissionSql, [row.id]);

  const permissions = permissionRows.map((r) => r.name);

  return generateTestCookie('access', row.id, email, permissions);
}

type ApiMethod = 'get' | 'put' | 'patch' | 'del' | 'post';

type RequestBody = Record<string, unknown>;
type RequestHeaders = Record<string, string>;
type ApiRequest = (
  path: string,
  body?: RequestBody,
  headers?: RequestHeaders,
) => Promise<Supertest.Response>;

type ApiClient = Record<ApiMethod, ApiRequest>;

const app = request(BASE_REQUEST);

const requestByMethod: Record<ApiMethod, (path: string) => Supertest.Test> = {
  get: (path) => app.get(path),
  put: (path) => app.put(path),
  patch: (path) => app.patch(path),
  del: (path) => app.delete(path),
  post: (path) => app.post(path),
};

const methods: ApiMethod[] = ['get', 'put', 'patch', 'del', 'post'];

// Build an ApiClient. When an access-token cookie is supplied every request carries it;
// otherwise requests are sent unauthenticated.
function buildClient(accessTokenCookie?: string): ApiClient {
  const client = {} as ApiClient;

  methods.forEach((method) => {
    client[method] = async (path, body = {}, headers = {}) => {
      const baseRequest = requestByMethod[method](path);
      const authedRequest = accessTokenCookie ? baseRequest.set('Cookie', accessTokenCookie) : baseRequest;

      const reply = await authedRequest
        .send(body)
        .set(headers)
        .set('Accept', 'application/json')
      ;

      if (reply.status === 500) {
        console.log('SERVER RESPONDED WITH a 500 Status. You should investigate this. Abandoning Tests.');
        console.log(JSON.stringify(reply.body));

        process.exit(1);
      }

      return reply;
    };
  });

  return client;
}

// api request with no authorization
const noAuthAPI = buildClient();

// api request with authorization of super user permissions
const SUPER_USER_EMAIL = 'user.super@email.com';
const authAPISuper = buildClient(await getAccessTokenCookieForEmail(SUPER_USER_EMAIL));

// api request with authorization of specific user permissions
async function authAPIUser(email: string): Promise<ApiClient> {
  return buildClient(await getAccessTokenCookieForEmail(email));
}

export {
  noAuthAPI,
  authAPISuper,
  authAPIUser,
};
