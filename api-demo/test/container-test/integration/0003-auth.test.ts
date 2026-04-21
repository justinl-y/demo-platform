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
  getFileNumber,
  setCookies,
} from '../lib/functions.ts';

import type Supertest from 'supertest';
import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Auth`, () => {
  describe('POST /login', async () => {
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

      test('Incorrect body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 'wrong-user@email.com';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });

      test('Incorrect body "password" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.password = 'wrong-password';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Authentication failed');
      });
    });

    describe('Request Success', async () => {
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

        const getUserTokenHash = `SELECT
            u.token_refresh_hash
            , u.last_login
          FROM
            public.users AS u
          WHERE
            u.email = $1;`;

        const [result] = await query<DbUserTokenHash>(getUserTokenHash, [validRequestBody.email]);

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

  describe.skip('POST /refresh', async () => {

  });
  describe.skip('PUT /logout', async () => {});
  // describe.skip('PUT /passwordRecovery', async () => {});
  describe.skip('PUT /passwordReset', async () => {});
  describe.skip('POST /invite', async () => {});
});
