import request from 'supertest';

import { BASE_REQUEST } from './constants.ts';
import { query } from './db.ts';
import { generateTestCookie } from './functions.ts';

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

const SUPER_USER_EMAIL = 'user.super@email.com';

const methods: ApiMethod[] = ['get', 'put', 'patch', 'del', 'post'];
const requestByMethod: Record<ApiMethod, (resource: string) => Supertest.Test> = {
  get: (resource) => app.get(resource),
  put: (resource) => app.put(resource),
  patch: (resource) => app.patch(resource),
  del: (resource) => app.delete(resource),
  post: (resource) => app.post(resource),
};

// Build an ApiClient. When an access-token cookie is supplied every request
// carries it; otherwise requests are sent unauthenticated.
function buildClient(accessTokenCookie?: string): ApiClient {
  const client = {} as ApiClient;

  methods.forEach((method) => {
    client[method] = async (resource, data = {}, headers = {}) => {
      const base = requestByMethod[method](resource);
      const authed = accessTokenCookie ? base.set('Cookie', accessTokenCookie) : base;

      const rep = await authed
        .send(data)
        .set(headers)
        .set('Accept', 'application/json');

      if (rep.status === 500) {
        console.log('SERVER RESPONDED WITH a 500 Status. You should investigate this. Abandoning Tests.');
        console.log(JSON.stringify(rep.body));
        process.exit(1);
      }

      return rep;
    };
  });

  return client;
}

// Build an access-token cookie for a seeded user, populated with that user's
// real permissions (so authorization behaves exactly as in production).
async function getAccessTokenCookieForEmail(email: string): Promise<string> {
  const getUserSql = 'SELECT u.id FROM internal.users AS u WHERE u.email = $1';
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

// Authenticated client for an arbitrary seeded user — drives authorization
// paths for users other than the super user (e.g. asserting a STAFF user is
// forbidden on a route that requires a permission they lack).
async function authAPIAs(email: string): Promise<ApiClient> {
  return buildClient(await getAccessTokenCookieForEmail(email));
}

const authAPI = buildClient(await getAccessTokenCookieForEmail(SUPER_USER_EMAIL));
const noAuthAPI = buildClient();

export {
  authAPI,
  noAuthAPI,
  authAPIAs,
};
