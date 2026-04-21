import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
import _ from 'lodash';
import bcrypt from 'bcryptjs';

import { query } from '../lib/db.ts';
import { noAuthAPI } from '../lib/api.ts';
import {
  generateTestCookie,
  getFileNumber,
  setCookies,
} from '../lib/functions.ts';

import type Supertest from 'supertest';
import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Auth`, () => {
  describe('POST /login', () => {
    const getResponse = (reqBody: any) => noAuthAPI.post('/login', reqBody);

    const validRequestBody = {
      email: 'user.super@email.com',
      password: 'user.super@email.com',
    } as RequestBody;

    describe('Request Failure', () => {
      test('Absent required body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        delete reqBody.email;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'email'`);
      });

      test('Absent required body "password" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        delete reqBody.password;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'password'`);
      });

      test('Invalid type body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 1234;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body/email must be string`);
      });

      test('Invalid type body "password" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.password = 1234;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body/password must be string`);
      });

      test('Incorrect body "email" returns 401', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 'wrong-user@email.com';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });

      test('Incorrect body "password" returns 401', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.password = 'wrong-password';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });
    });

    describe('Request Success', () => {
      interface DbUserTokenHash {
        token_refresh_hash: string;
        last_login: Date;
      }

      let rep: Supertest.Response;
      let cookies: string[];
      let requestTime: Date;
      let tokenRefreshHash: string;
      let lastLogin: Date;

      beforeAll(async () => {
        requestTime = new Date();
        rep = await getResponse(validRequestBody);
        cookies = setCookies(rep.headers);

        const getUserTokenHashSql = `SELECT
            u.token_refresh_hash
            , u.last_login
          FROM
            public.users AS u
          WHERE
            u.email = $1;`;

        const [result] = await query<DbUserTokenHash>(getUserTokenHashSql, [validRequestBody.email]);

        ({ token_refresh_hash: tokenRefreshHash, last_login: lastLogin } = result);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response sets "access_token" cookie', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='));

        expect(cookie).toBeDefined();
      });

      test('Response sets "refresh_token" cookie', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='));

        expect(cookie).toBeDefined();
      });

      test('Check "access_token" cookie value is a valid JWT', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='))!;
        const value = cookie.split(';')[0].replace('access_token=', '');

        expect(value).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      test('Check "refresh_token" cookie value is a valid JWT', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='))!;
        const value = cookie.split(';')[0].replace('refresh_token=', '');

        expect(value).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      test('Check "access_token" cookie has correct attributes', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='))!;

        expect(cookie).toContain('Max-Age=3600');
        expect(cookie).toContain('Path=/');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
      });

      test('Check "refresh_token" cookie has correct attributes', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='))!;

        expect(cookie).toContain('Max-Age=604800');
        expect(cookie).toContain('Path=/');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
      });

      test('Check "refresh_token" cookie value matches persisted hash in db', async () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='))!;
        const refreshToken = cookie.split(';')[0].replace('refresh_token=', '');
        const isMatch = await bcrypt.compare(refreshToken, tokenRefreshHash);

        expect(isMatch).toBe(true);
      });

      test('Check "last_login" is set to approximately the time of login', () => {
        expect(lastLogin).toBeDefined();
        expect(new Date(lastLogin).getTime()).toBeGreaterThanOrEqual(requestTime.getTime() - 5000);
        expect(new Date(lastLogin).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
      });
    });
  });

  describe('POST /refresh', () => {
    const userEmail = 'user.super@email.com';

    const getResponse = (cookieString?: string) =>
      noAuthAPI.post('/refresh', {}, cookieString ? { Cookie: cookieString } : {});

    describe('Request Failure', () => {
      let refreshTokenCookie: string;
      let accessTokenValue: string;

      beforeAll(async () => {
        const getUserIdByEmailSql = 'SELECT u.id FROM public.users AS u WHERE u.email = $1';

        const [{ id: userId }] = await query<{ id: string }>(
          getUserIdByEmailSql,
          [userEmail],
        );

        refreshTokenCookie = generateTestCookie('refresh', userId, userEmail);
        accessTokenValue = generateTestCookie('access', userId, userEmail).replace('access_token=', '');

        await query(
          'UPDATE public.users SET token_refresh_hash = NULL WHERE id = $1',
          [userId],
        );
      });

      test('Absent "refresh_token" cookie returns 401', async () => {
        const res = await getResponse();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });

      test('Malformed "refresh_token" cookie value returns 401', async () => {
        const res = await getResponse('refresh_token=not-a-valid-jwt');

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });

      test('Access token sent as "refresh_token" cookie returns 401', async () => {
        const res = await getResponse(`refresh_token=${accessTokenValue}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Incorrect authorization token type');
      });

      test('Stale "refresh_token" cookie returns 401', async () => {
        const res = await getResponse(refreshTokenCookie);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });
    });

    describe('Request Success', () => {
      interface DbUserRefreshHash {
        token_refresh_hash: string;
      }

      let rep: Supertest.Response;
      let cookies: string[];
      let tokenRefreshHash: string;

      beforeAll(async () => {
        const getUserIdByEmailSql = 'SELECT u.id FROM public.users AS u WHERE u.email = $1';
        const [{ id: userId }] = await query<{ id: string }>(getUserIdByEmailSql, [userEmail]);

        const freshRefreshTokenCookie = generateTestCookie('refresh', userId, userEmail);
        const freshRefreshToken = freshRefreshTokenCookie.replace('refresh_token=', '');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(freshRefreshToken, salt);

        const setUserTokenRefreshHash = 'UPDATE public.users SET token_refresh_hash = $1 WHERE id = $2';
        await query(setUserTokenRefreshHash, [hash, userId]);

        rep = await getResponse(freshRefreshTokenCookie);
        cookies = setCookies(rep.headers);

        const getUsertokenRefreshHashSql = 'SELECT u.token_refresh_hash FROM public.users AS u WHERE u.email = $1';
        const [result] = await query<DbUserRefreshHash>(getUsertokenRefreshHashSql, [userEmail]);

        ({ token_refresh_hash: tokenRefreshHash } = result);
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Response sets "access_token" cookie', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='));

        expect(cookie).toBeDefined();
      });

      test('Response sets "refresh_token" cookie', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='));

        expect(cookie).toBeDefined();
      });

      test('Check "access_token" cookie value is a valid JWT', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='))!;
        const value = cookie.split(';')[0].replace('access_token=', '');

        expect(value).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      test('Check "refresh_token" cookie value is a valid JWT', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='))!;
        const value = cookie.split(';')[0].replace('refresh_token=', '');

        expect(value).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      });

      test('Check "access_token" cookie has correct attributes', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='))!;

        expect(cookie).toContain('Max-Age=3600');
        expect(cookie).toContain('Path=/');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
      });

      test('Check "refresh_token" cookie has correct attributes', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='))!;

        expect(cookie).toContain('Max-Age=604800');
        expect(cookie).toContain('Path=/');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Lax');
      });

      test('Check "refresh_token" cookie value matches persisted hash in db', async () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='))!;
        const refreshToken = cookie.split(';')[0].replace('refresh_token=', '');
        const isMatch = await bcrypt.compare(refreshToken, tokenRefreshHash);

        expect(isMatch).toBe(true);
      });
    });
  });
  describe.skip('PUT /logout', () => {});
  // describe.skip('PUT /passwordRecovery', () => {});
  describe.skip('PUT /passwordReset', () => {});
  describe.skip('POST /invite', () => {});
});
