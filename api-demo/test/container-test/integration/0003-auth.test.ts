import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/en';

import { query } from '../lib/db.ts';
import { noAuthAPI } from '../lib/api.ts';
import {
  createRandomUser,
  generateTestCookie,
  getFileNumber,
  seedUserWithResetToken,
  setCookies,
  waitForCondition,
} from '../lib/functions.ts';

import type Supertest from 'supertest';
import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Auth`, () => {
  let userId: string;
  let userEmail: string;

  beforeAll(async () => {
    ({
      userId, email: userEmail,
    } = await createRandomUser());
  });

  describe('POST /login', () => {
    const getResponse = (reqBody: any) => noAuthAPI.post('/login', reqBody);

    let validRequestBody = {} as RequestBody;

    beforeAll(() => {
      validRequestBody = {
        email: userEmail,
        password: userEmail,
      } as RequestBody;
    });

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
        refresh_token_hash: string;
        last_login: Date;
      }

      let rep: Supertest.Response;
      let cookies: string[];
      let requestTime: Date;
      let refreshTokenHash: string;
      let lastLogin: Date;

      beforeAll(async () => {
        requestTime = new Date();
        rep = await getResponse(validRequestBody);
        cookies = setCookies(rep.headers);

        const getUserTokenHashSql = `SELECT
            a.refresh_token_hash
            , a.last_login
          FROM
            public.users AS u
            INNER JOIN public.users_authentication AS a ON a.user_id = u.id
          WHERE
            u.email = $1;`;

        const [result] = await query<DbUserTokenHash>(getUserTokenHashSql, [userEmail]);

        ({
          refresh_token_hash: refreshTokenHash, last_login: lastLogin,
        } = result);
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
        const isMatch = await bcrypt.compare(refreshToken, refreshTokenHash);

        expect(isMatch).toBe(true);
      });

      test('Check "last_login" is set to approximately the time of login', () => {
        expect(lastLogin).toBeDefined();
        expect(new Date(lastLogin).getTime()).toBeGreaterThanOrEqual(requestTime.getTime() - 5000);
        expect(new Date(lastLogin).getTime()).toBeLessThanOrEqual(Date.now() + 1000);
      });

      test('"email" with mixed case and whitespace is normalized before matching', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse({
          email: `  ${email.toUpperCase()}  `,
          password: email,
        });

        expect(res.statusCode).toBe(200);
      });
    });
  });

  describe('POST /refresh', () => {
    const getResponse = (cookieString?: string) =>
      noAuthAPI.post('/refresh', {}, cookieString ? { Cookie: cookieString } : {});

    describe('Request Failure', () => {
      let refreshTokenCookie: string;
      let accessTokenValue: string;

      beforeAll(async () => {
        refreshTokenCookie = generateTestCookie('refresh', userId, userEmail);
        accessTokenValue = generateTestCookie('access', userId, userEmail).replace('access_token=', '');

        await query(
          `UPDATE
              public.users_authentication
            SET
              refresh_token_hash = NULL
            WHERE
              user_id = $1;`,
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
        refresh_token_hash: string;
      }

      let rep: Supertest.Response;
      let cookies: string[];
      let refreshTokenHash: string;

      beforeAll(async () => {
        const freshRefreshTokenCookie = generateTestCookie('refresh', userId, userEmail);
        const freshRefreshToken = freshRefreshTokenCookie.replace('refresh_token=', '');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(freshRefreshToken, salt);

        const setUserRefreshTokenHash = `UPDATE
          public.users_authentication
        SET
          refresh_token_hash = $1
        WHERE
          user_id = $2;`;
        await query(setUserRefreshTokenHash, [hash, userId]);

        rep = await getResponse(freshRefreshTokenCookie);
        cookies = setCookies(rep.headers);

        const getRefreshTokenHashSql = `SELECT
          a.refresh_token_hash
        FROM
          public.users_authentication AS a
        WHERE
          a.user_id = $1;`;
        const [result] = await query<DbUserRefreshHash>(getRefreshTokenHashSql, [userId]);

        ({
          refresh_token_hash: refreshTokenHash,
        } = result);
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
        const isMatch = await bcrypt.compare(refreshToken, refreshTokenHash);

        expect(isMatch).toBe(true);
      });
    });
  });

  describe('POST /logout', () => {
    let logoutUserId: string;
    let logoutUserEmail: string;

    beforeAll(async () => {
      ({
        userId: logoutUserId, email: logoutUserEmail,
      } = await createRandomUser());
    });

    const getResponse = (cookieString?: string) =>
      noAuthAPI.post('/logout', {}, cookieString ? { Cookie: cookieString } : {});

    describe('Request Failure', () => {
      let accessTokenValue: string;

      beforeAll(() => {
        accessTokenValue = generateTestCookie('access', logoutUserId, logoutUserEmail).replace('access_token=', '');
      });

      test('Absent "refresh_token" cookie returns 400', async () => {
        const res = await getResponse();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Refresh token required');
      });

      test('Malformed "refresh_token" cookie value returns 400', async () => {
        const res = await getResponse('refresh_token=not-a-valid-jwt');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid token');
      });

      test('Access token sent as "refresh_token" cookie returns 400', async () => {
        const res = await getResponse(`refresh_token=${accessTokenValue}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Incorrect authorization token type');
      });
    });

    describe('Request Success', () => {
      interface DbUserRefreshHash {
        refresh_token_hash: string | null;
      }

      let rep: Supertest.Response;
      let cookies: string[];
      let refreshTokenCookie: string;
      let refreshTokenHash: string | null;

      beforeAll(async () => {
        refreshTokenCookie = generateTestCookie('refresh', logoutUserId, logoutUserEmail);
        const refreshToken = refreshTokenCookie.replace('refresh_token=', '');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(refreshToken, salt);

        await query(
          `UPDATE
              public.users_authentication
            SET
              refresh_token_hash = $1
            WHERE
              user_id = $2;`,
          [hash, logoutUserId],
        );

        rep = await getResponse(refreshTokenCookie);
        cookies = setCookies(rep.headers);

        const getRefreshTokenHashSql = `SELECT
          a.refresh_token_hash
        FROM
          public.users_authentication AS a
        WHERE
          a.user_id = $1;`;
        const [result] = await query<DbUserRefreshHash>(getRefreshTokenHashSql, [logoutUserId]);

        ({
          refresh_token_hash: refreshTokenHash,
        } = result);
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('User "refresh_token_hash" is NULL in db after logout', () => {
        expect(refreshTokenHash).toBeNull();
      });

      test('Response clears "access_token" cookie', () => {
        const cookie = cookies.find((c) => c.startsWith('access_token='));

        expect(cookie).toBeDefined();
        expect(cookie).toContain('Max-Age=0');
        expect(cookie).toContain('Path=/');
      });

      test('Response clears "refresh_token" cookie', () => {
        const cookie = cookies.find((c) => c.startsWith('refresh_token='));

        expect(cookie).toBeDefined();
        expect(cookie).toContain('Max-Age=0');
        expect(cookie).toContain('Path=/');
      });

      test('Subsequent logout with same token returns 204', async () => {
        const res = await getResponse(refreshTokenCookie);

        expect(res.statusCode).toBe(204);
      });
    });
  });

  describe('POST /password/forgot', () => {
    const getResponse = (reqBody: any) => noAuthAPI.post('/password/forgot', reqBody);

    let validRequestBody = {} as RequestBody;

    beforeAll(() => {
      validRequestBody = {
        email: userEmail,
      } as RequestBody;
    });

    describe('Request Failure', () => {
      test('Absent required body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        delete reqBody.email;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'email'`);
      });

      test('Invalid type body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 1234;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body/email must be string`);
      });

      test('Invalid format body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 'not-an-email';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/email must match format "email"');
      });
    });

    describe('Request Success', () => {
      interface DbPasswordReset {
        password_reset_token_hash: string | null;
        password_reset_token_expiry_at: Date | null;
        password_reset_email_sent_at: Date | null;
      }

      const getPasswordResetSql = `SELECT
          a.password_reset_token_hash
          , a.password_reset_token_expiry_at
          , a.password_reset_email_sent_at
        FROM
          public.users AS u
          INNER JOIN public.users_authentication AS a ON a.user_id = u.id
        WHERE
          u.email = $1;`;

      let rep: Supertest.Response;
      let requestTime: Date;
      let dbPasswordReset: DbPasswordReset;

      beforeAll(async () => {
        requestTime = new Date();
        rep = await getResponse(validRequestBody);

        // The send + email-sent stamp run off the request path, so poll until the
        // background stamp lands. The token hash/expiry are written synchronously,
        // so the polled row carries them too.
        dbPasswordReset = await waitForCondition(async () => {
          const [result] = await query<DbPasswordReset>(getPasswordResetSql, [userEmail]);

          return result.password_reset_email_sent_at ? result : undefined;
        });
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Persists a "password_reset_token_hash" in db', () => {
        expect(dbPasswordReset.password_reset_token_hash).toMatch(/^[0-9a-f]{64}$/);
      });

      test('Sets "password_reset_token_expiry_at" approximately 30 minutes in the future', () => {
        expect(dbPasswordReset.password_reset_token_expiry_at).not.toBeNull();

        const expiry = new Date(dbPasswordReset.password_reset_token_expiry_at!).getTime();
        const expected = requestTime.getTime() + 30 * 60 * 1000;

        expect(expiry).toBeGreaterThanOrEqual(expected - 5000);
        expect(expiry).toBeLessThanOrEqual(expected + 5000);
      });

      test('Stamps "password_reset_email_sent_at" after a successful send', () => {
        expect(dbPasswordReset.password_reset_email_sent_at).not.toBeNull();
      });

      test('Unknown email returns 204 without revealing account existence', async () => {
        const res = await getResponse({
          email: `unknown-${faker.string.alphanumeric(10).toLowerCase()}@example.com`,
        });

        expect(res.statusCode).toBe(204);
      });

      test('"email" with mixed case and whitespace is normalized before matching', async () => {
        const {
          email,
        } = await createRandomUser();

        const res = await getResponse({
          email: `  ${email.toUpperCase()}  `,
        });

        expect(res.statusCode).toBe(204);

        const [result] = await query<DbPasswordReset>(getPasswordResetSql, [email]);

        expect(result.password_reset_token_hash).toMatch(/^[0-9a-f]{64}$/);
      });
    });

    describe('Request Success - email delivery failure', () => {
      interface DbPasswordReset {
        password_reset_token_hash: string | null;
        password_reset_token_expiry_at: Date | null;
        password_reset_email_sent_at: Date | null;
      }

      const getPasswordResetSql = `SELECT
          a.password_reset_token_hash
          , a.password_reset_token_expiry_at
          , a.password_reset_email_sent_at
        FROM
          public.users AS u
          INNER JOIN public.users_authentication AS a ON a.user_id = u.id
        WHERE
          u.email = $1;`;

      let rep: Supertest.Response;
      let dbPasswordReset: DbPasswordReset;

      // The mailer test seam in src/lib/mailer.ts throws on this sentinel domain (RFC 2606 .test TLD).
      const failEmail = `reset-fail-${faker.string.alphanumeric(10).toLowerCase()}@mailer-fail.test`;

      beforeAll(async () => {
        await createRandomUser({
          email: failEmail,
        });

        rep = await getResponse({
          email: failEmail,
        });

        const [result] = await query<DbPasswordReset>(getPasswordResetSql, [failEmail]);
        dbPasswordReset = result;
      });

      test('Response returns 204 even when the email delivery fails', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Reset token is still persisted on email failure', () => {
        expect(dbPasswordReset.password_reset_token_hash).toMatch(/^[0-9a-f]{64}$/);
        expect(dbPasswordReset.password_reset_token_expiry_at).not.toBeNull();
      });

      test('Database "password_reset_email_sent_at" remains NULL on failure', () => {
        expect(dbPasswordReset.password_reset_email_sent_at).toBeNull();
      });
    });
  });

  describe('POST /password/reset', () => {
    const getResponse = (reqBody: RequestBody) => noAuthAPI.post('/password/reset', reqBody);

    const validPassword = 'TestPass123!@#abc';
    const validTokenLength = 30;

    describe('Request Failure', () => {
      test('Absent required body "password_reset_token" returns 400', async () => {
        const res = await getResponse({ new_password: validPassword });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'password_reset_token'`);
      });

      test('Absent required body "new_password" returns 400', async () => {
        const res = await getResponse({ password_reset_token: faker.string.alphanumeric(validTokenLength) });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'new_password'`);
      });

      test('Invalid type body "password_reset_token" returns 400', async () => {
        const res = await getResponse({
          password_reset_token: 1234,
          new_password: validPassword,
        } as unknown as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password_reset_token must be string');
      });

      test('Invalid type body "new_password" returns 400', async () => {
        const res = await getResponse({
          password_reset_token: faker.string.alphanumeric(validTokenLength),
          new_password: 1234,
        } as unknown as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/new_password must be string');
      });

      test('Token shorter than the minimum returns 400', async () => {
        const res = await getResponse({
          password_reset_token: faker.string.alphanumeric(10),
          new_password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password_reset_token must NOT have fewer than 30 characters');
      });

      test('Token longer than the maximum returns 400', async () => {
        const res = await getResponse({
          password_reset_token: faker.string.alphanumeric(40),
          new_password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password_reset_token must NOT have more than 30 characters');
      });

      test('Password shorter than the minimum returns 400', async () => {
        const res = await getResponse({
          password_reset_token: faker.string.alphanumeric(validTokenLength),
          new_password: 'short',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/new_password must NOT have fewer than 10 characters');
      });

      test('Password longer than the maximum returns 400', async () => {
        const res = await getResponse({
          password_reset_token: faker.string.alphanumeric(validTokenLength),
          new_password: 'a'.repeat(41),
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/new_password must NOT have more than 40 characters');
      });

      test('Unknown token returns 400', async () => {
        const res = await getResponse({
          password_reset_token: faker.string.alphanumeric(validTokenLength),
          new_password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid or expired password reset token');
      });

      test('Expired token returns 400', async () => {
        const prefix = 'expired-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;

        await seedUserWithResetToken({
          rawToken,
          expiresAt: new Date(Date.now() - 1000),
        });

        const res = await getResponse({
          password_reset_token: rawToken,
          new_password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid or expired password reset token');
      });

      test('Token for a non-active user returns 400', async () => {
        const prefix = 'inactive-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;

        await seedUserWithResetToken({
          rawToken,
          status: 'DEACTIVATED',
        });

        const res = await getResponse({
          password_reset_token: rawToken,
          new_password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid or expired password reset token');
      });

      test('Already-used token returns 400 on the second reset', async () => {
        const prefix = 'used-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;

        await seedUserWithResetToken({ rawToken });

        const first = await getResponse({
          password_reset_token: rawToken,
          new_password: validPassword,
        });
        const second = await getResponse({
          password_reset_token: rawToken,
          new_password: validPassword,
        });

        expect(first.statusCode).toBe(204);
        expect(second.statusCode).toBe(400);
        expect(second.body.message).toBe('Invalid or expired password reset token');
      });
    });

    describe('Request Success', () => {
      interface DbReset {
        password_hash: string | null;
        password_reset_token_hash: string | null;
        password_reset_token_expiry_at: Date | null;
        refresh_token_hash: string | null;
      }

      const getResetSql = `SELECT
        a.password_hash
        , a.password_reset_token_hash
        , a.password_reset_token_expiry_at
        , a.refresh_token_hash
      FROM
        public.users_authentication AS a
      WHERE
        a.user_id = $1;`;

      let resetUserId: string;
      let rawToken: string;
      let rep: Supertest.Response;
      let dbReset: DbReset;

      beforeAll(async () => {
        const prefix = 'valid-';
        rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;

        ({
          userId: resetUserId,
        } = await seedUserWithResetToken({ rawToken }));

        rep = await getResponse({
          password_reset_token: rawToken,
          new_password: validPassword,
        });

        const [result] = await query<DbReset>(getResetSql, [resetUserId]);
        dbReset = result;
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Response body is empty', () => {
        expect(rep.body).toEqual({});
      });

      test('Password is persisted as a bcrypt hash of the new password', async () => {
        expect(dbReset.password_hash).not.toBeNull();
        expect(await bcrypt.compare(validPassword, dbReset.password_hash as string)).toBe(true);
      });

      test('Password reset token hash is cleared in the database', () => {
        expect(dbReset.password_reset_token_hash).toBeNull();
      });

      test('Password reset token expiry is cleared in the database', () => {
        expect(dbReset.password_reset_token_expiry_at).toBeNull();
      });

      test('Refresh token hash is cleared to invalidate existing sessions', () => {
        expect(dbReset.refresh_token_hash).toBeNull();
      });
    });
  });
});
