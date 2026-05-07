import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
// import _ from 'lodash';
// import bcrypt from 'bcryptjs';

// import { query } from '../lib/db.ts';
import { authAPI } from '../lib/api.ts';
import {
  createRandomUser,
  // generateTestCookie,
  getFileNumber,
  // setCookies,
} from '../lib/functions.ts';

import type Supertest from 'supertest';
// import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Users`, () => {
  describe('GET /users - all', () => {
    let activeUserId: string;
    let inactiveUserId: string;

    beforeAll(async () => {
      ({
        userId: activeUserId,
      } = await createRandomUser({ isActive: true }));

      ({
        userId: inactiveUserId,
      } = await createRandomUser({ isActive: false }));
    });

    const getResponse = () => authAPI.get('/users');

    describe('Request Failure', () => {
      test('"inactive" with invalid value returns 400', async () => {
        const res = await authAPI.get('/users?inactive=invalid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/inactive must be equal to one of the allowed values');
      });

      test('"page" of "0" returns 400', async () => {
        const res = await authAPI.get('/users?page=0');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
      });

      test('"page" of non-numeric string returns 400', async () => {
        const res = await authAPI.get('/users?page=abc');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
      });

      test('"per_page" of "0" returns 400', async () => {
        const res = await authAPI.get('/users?per_page=0');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });

      test('"per_page" of "101" returns 400', async () => {
        const res = await authAPI.get('/users?per_page=101');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });

      test('"per_page" of non-numeric string returns 400', async () => {
        const res = await authAPI.get('/users?per_page=abc');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });
    });

    describe('Request Success', () => {
      let rep: Supertest.Response;

      beforeAll(async () => {
        rep = await getResponse();
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body has correct shape', () => {
        expect(rep.body).toHaveProperty('output');
        expect(rep.body).toHaveProperty('count');
        expect(rep.body).toHaveProperty('pagination');
        expect(rep.body.output).toBeTypeOf('object');
        expect(Array.isArray(rep.body.output)).toBe(false);
        expect(rep.body.count).toBeTypeOf('number');
        expect(rep.body.pagination).toHaveProperty('page');
        expect(rep.body.pagination).toHaveProperty('pages');
      });

      test('Response entries have correct shape', () => {
        const user = rep.body.output[activeUserId];

        expect(user).toBeDefined();
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('known_as');
        expect(user).toHaveProperty('is_active');
        expect(user.is_active).toBeTypeOf('boolean');
      });

      test('"inactive=include" returns both active and inactive users', async () => {
        const res = await authAPI.get('/users?inactive=include');

        expect(res.body.output[activeUserId]).toBeDefined();
        expect(res.body.output[inactiveUserId]).toBeDefined();
      });

      test('"inactive=exclude" returns only active users', async () => {
        const res = await authAPI.get('/users?inactive=exclude');

        expect(res.body.output[activeUserId]).toBeDefined();
        expect(res.body.output[inactiveUserId]).toBeUndefined();
      });

      test('"inactive=only" returns only inactive users', async () => {
        const res = await authAPI.get('/users?inactive=only');

        expect(res.body.output[activeUserId]).toBeUndefined();
        expect(res.body.output[inactiveUserId]).toBeDefined();
      });

      test('"per_page=1" returns exactly one user', async () => {
        const res = await authAPI.get('/users?inactive=include&per_page=1');

        expect(res.statusCode).toBe(200);
        expect(Object.keys(res.body.output)).toHaveLength(1);
        expect(res.body.count).toBe(1);
        expect(res.body.pagination.pages).toBeGreaterThanOrEqual(1);
      });

      test('page=1 and page=2 with per_page=1 return different users', async () => {
        const [res1, res2] = await Promise.all([
          authAPI.get('/users?inactive=include&per_page=1&page=1'),
          authAPI.get('/users?inactive=include&per_page=1&page=2'),
        ]);

        expect(Object.keys(res1.body.output)).toHaveLength(1);
        expect(Object.keys(res2.body.output)).toHaveLength(1);
        expect(Object.keys(res1.body.output)[0]).not.toBe(Object.keys(res2.body.output)[0]);
      });

      test('"page=9999" returns empty output with count 0', async () => {
        const res = await authAPI.get('/users?inactive=include&page=9999&per_page=100');

        expect(res.statusCode).toBe(200);
        expect(res.body.output).toEqual({});
        expect(res.body.count).toBe(0);
      });
    });
  });

  describe('GET /users - single', () => {
    let activeUserId: string;
    let activeUserEmail: string;

    beforeAll(async () => {
      ({
        userId: activeUserId, email: activeUserEmail,
      } = await createRandomUser({ isActive: true }));
    });

    const getResponse = (userId: string) => authAPI.get(`/users?user_id=${userId}`);

    describe('Request Failure', () => {
      test('Non-UUID string "user_id" returns 400', async () => {
        const res = await authAPI.get('/users?user_id=not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await authAPI.get('/users?user_id=12345');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 200 with empty output and count 0', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid);

        expect(res.statusCode).toBe(200);
        expect(res.body.output).toEqual({});
        expect(res.body.count).toBe(0);
      });
    });

    describe('Request Success', () => {
      let rep: Supertest.Response;

      beforeAll(async () => {
        rep = await getResponse(activeUserId);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body has correct shape', () => {
        expect(rep.body).toHaveProperty('output');
        expect(rep.body).toHaveProperty('count');
        expect(rep.body).toHaveProperty('pagination');
        expect(rep.body.output).toBeTypeOf('object');
        expect(Array.isArray(rep.body.output)).toBe(false);
        expect(rep.body.count).toBeTypeOf('number');
      });

      test('Response entry has correct shape', () => {
        const user = rep.body.output[activeUserId];

        expect(user).toBeDefined();
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('known_as');
        expect(user).toHaveProperty('is_active');
        expect(user.is_active).toBeTypeOf('boolean');
      });

      test('Response contains only the requested user', () => {
        expect(Object.keys(rep.body.output)).toHaveLength(1);
        expect(rep.body.output[activeUserId]).toBeDefined();
        expect(rep.body.count).toBe(1);
      });

      test('Returned user has correct data', () => {
        expect(rep.body.output[activeUserId].email).toBe(activeUserEmail);
      });
    });
  });

  describe.skip('POST /users', () => {});
  describe.skip('PUT /users/:userID', () => {});
});
