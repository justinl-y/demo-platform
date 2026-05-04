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
    let activeUserEmail: string;
    let inactiveUserId: string;

    beforeAll(async () => {
      ({
        userId: activeUserId, email: activeUserEmail,
      } = await createRandomUser({ isActive: true }));

      ({
        userId: inactiveUserId,
      } = await createRandomUser({ isActive: false }));
    });

    const getResponse = () => authAPI.get('/users');

    describe('Request Success', () => {
      let rep: Supertest.Response;

      beforeAll(async () => {
        rep = await getResponse();
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body is a non-array object', () => {
        expect(rep.body).toBeTypeOf('object');
        expect(Array.isArray(rep.body)).toBe(false);
      });

      test('Response entries have correct shape', () => {
        const user = rep.body[activeUserId];

        expect(user).toBeDefined();
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('known_as');
      });

      test('Active user is included in response', () => {
        expect(rep.body[activeUserId]).toBeDefined();
        expect(rep.body[activeUserId].email).toBe(activeUserEmail);
      });

      test('Inactive user is excluded from response', () => {
        expect(rep.body[inactiveUserId]).toBeUndefined();
      });
    });
  });

  describe('GET /users - single', () => {
    let activeUserId: string;
    let activeUserEmail: string;
    let inactiveUserId: string;

    beforeAll(async () => {
      ({
        userId: activeUserId, email: activeUserEmail,
      } = await createRandomUser({ isActive: true }));

      ({
        userId: inactiveUserId,
      } = await createRandomUser({ isActive: false }));
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

      test('Unknown UUID returns 200 and an empty object', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({});
      });

      test('Inactive user UUID returns 200 and an empty object', async () => {
        const res = await getResponse(inactiveUserId);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({});
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

      test('Response body is a non-array object', () => {
        expect(rep.body).toBeTypeOf('object');
        expect(Array.isArray(rep.body)).toBe(false);
      });

      test('Response entry has correct shape', () => {
        const user = rep.body[activeUserId];

        expect(user).toBeDefined();
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('known_as');
      });

      test('Response contains only the requested user', () => {
        expect(Object.keys(rep.body)).toHaveLength(1);
        expect(rep.body[activeUserId]).toBeDefined();
      });

      test('Returned user has correct data', () => {
        expect(rep.body[activeUserId].email).toBe(activeUserEmail);
      });
    });
  });

  describe.skip('POST /users', () => {});
  describe.skip('PUT /users/:userID', () => {});
});
