import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
import _ from 'lodash';
import { faker } from '@faker-js/faker/locale/en';
import bcrypt from 'bcryptjs';

import { query } from '../lib/db.ts';
import { authAPI, noAuthAPI } from '../lib/api.ts';
import {
  createRandomUser,
  getFileNumber,
  sha256Hex,
} from '../lib/functions.ts';

import type Supertest from 'supertest';
import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Users`, () => {
  describe('GET /users - all', () => {
    let activeUserId: string;
    let deactivatedUserId: string;

    beforeAll(async () => {
      ({
        userId: activeUserId,
      } = await createRandomUser());

      ({
        userId: deactivatedUserId,
      } = await createRandomUser({ status: 'DEACTIVATED' }));
    });

    const getResponse = () => authAPI.get('/users');

    describe('Request Failure', () => {
      test('"status" with invalid value returns 400', async () => {
        const res = await authAPI.get('/users?status=invalid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('querystring/status');
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
        expect(user).toHaveProperty('status');
        expect(user.status).toBeTypeOf('string');
      });

      test('"status=ACTIVE&status=DEACTIVATED" returns both active and deactivated users', async () => {
        const res = await authAPI.get('/users?status=ACTIVE&status=DEACTIVATED');

        expect(res.body.output[activeUserId]).toBeDefined();
        expect(res.body.output[deactivatedUserId]).toBeDefined();
      });

      test('"status=ACTIVE" returns only active users', async () => {
        const res = await authAPI.get('/users?status=ACTIVE');

        expect(res.body.output[activeUserId]).toBeDefined();
        expect(res.body.output[deactivatedUserId]).toBeUndefined();
      });

      test('"status=DEACTIVATED" returns only deactivated users', async () => {
        const res = await authAPI.get('/users?status=DEACTIVATED');

        expect(res.body.output[activeUserId]).toBeUndefined();
        expect(res.body.output[deactivatedUserId]).toBeDefined();
      });

      test('"per_page=1" returns exactly one user', async () => {
        const res = await authAPI.get('/users?per_page=1');

        expect(res.statusCode).toBe(200);
        expect(Object.keys(res.body.output)).toHaveLength(1);
        expect(res.body.count).toBe(1);
        expect(res.body.pagination.pages).toBeGreaterThanOrEqual(1);
      });

      test('page=1 and page=2 with per_page=1 return different users', async () => {
        const [res1, res2] = await Promise.all([
          authAPI.get('/users?per_page=1&page=1'),
          authAPI.get('/users?per_page=1&page=2'),
        ]);

        expect(Object.keys(res1.body.output)).toHaveLength(1);
        expect(Object.keys(res2.body.output)).toHaveLength(1);
        expect(Object.keys(res1.body.output)[0]).not.toBe(Object.keys(res2.body.output)[0]);
      });

      test('"page=9999" returns empty output with count 0', async () => {
        const res = await authAPI.get('/users?page=9999&per_page=100');

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
      } = await createRandomUser());
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
        expect(user).toHaveProperty('status');
        expect(user.status).toBeTypeOf('string');
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

  describe('POST /users', () => {
    const getResponse = (reqBody: RequestBody) => authAPI.post('/users', reqBody);

    let validRequestBody = {} as RequestBody;

    beforeAll(() => {
      const firstName = faker.person.firstName().replace(/'/g, '');
      const lastName = faker.person.lastName().replace(/'/g, '');

      validRequestBody = {
        email: faker.internet.email({
          firstName,
          lastName,
        }).toLowerCase(),
        full_name: `${firstName} ${lastName}`,
        known_as: firstName,
      };
    });

    describe('Request Failure', () => {
      test('Absent required body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        delete reqBody.email;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'email'`);
      });

      test('Absent required body "full_name" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        delete reqBody.full_name;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'full_name'`);
      });

      test('Invalid type body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 1234;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/email must be string');
      });

      test('Invalid format body "email" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.email = 'not-an-email';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/email must match format "email"');
      });

      test('Invalid type body "full_name" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.full_name = 1234;

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/full_name must be string');
      });

      test('Empty string body "full_name" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.full_name = '';

        const res = await getResponse(reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/full_name must NOT have fewer than 1 characters');
      });

      test('Duplicate "email" returns 400', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse({
          ...validRequestBody,
          email,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Supplied user email is not unique');
      });

      test('Duplicate "email" differing only by case returns 400', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse({
          ...validRequestBody,
          email: email.toUpperCase(),
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Supplied user email is not unique');
      });

      test('Duplicate "email" differing only by whitespace returns 400', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse({
          ...validRequestBody,
          email: `  ${email}  `,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Supplied user email is not unique');
      });
    });

    describe('Request Success', () => {
      interface DbUser {
        user_id: string;
        email: string;
        full_name: string;
        known_as: string | null;
        status: string;
      }

      let rep: Supertest.Response;
      let dbUser: DbUser;
      let responseBody: DbUser;

      beforeAll(async () => {
        rep = await getResponse(validRequestBody);

        const getUserByIdSql = `SELECT
          u.id AS user_id
          , u.email
          , u.full_name
          , u.known_as
          , u.status
        FROM
          public.users AS u
        WHERE
          u.id = $1;`;
        const [result] = await query<DbUser>(getUserByIdSql, [rep.body.user_id]);

        dbUser = result;

        ({
          body: responseBody,
        } = rep);
      });

      test('Success response returns 201', () => {
        expect(rep.statusCode).toBe(201);
      });

      test('Response body has correct shape', () => {
        expect(responseBody).toHaveProperty('user_id');
        expect(responseBody).toHaveProperty('email');
        expect(responseBody).toHaveProperty('full_name');
        expect(responseBody).toHaveProperty('known_as');
        expect(responseBody).toHaveProperty('status');
      });

      test('Response "user_id" is a UUID', () => {
        expect(responseBody.user_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      });

      test('Response "email" matches request', () => {
        expect(responseBody.email).toBe(validRequestBody.email);
      });

      test('Response "full_name" matches request', () => {
        expect(responseBody.full_name).toBe(validRequestBody.full_name);
      });

      test('Response "known_as" matches request', () => {
        expect(responseBody.known_as).toBe(validRequestBody.known_as);
      });

      test('Response "status" is "CREATED"', () => {
        expect(responseBody.status).toBe('CREATED');
      });

      test('User data is persisted in the database', () => {
        expect(dbUser).toBeDefined();
        expect(dbUser.email).toBe(validRequestBody.email);
        expect(dbUser.full_name).toBe(validRequestBody.full_name);
        expect(dbUser.known_as).toBe(validRequestBody.known_as);
        expect(dbUser.status).toBe('CREATED');
      });

      test('"email" with mixed case and whitespace is normalized in response and database', async () => {
        const baseEmail = faker.internet.email().toLowerCase();
        const res = await getResponse({
          ...validRequestBody,
          email: `  ${baseEmail.toUpperCase()}  `,
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.email).toBe(baseEmail);

        const getUserByIdSql = `SELECT
          u.email
        FROM
          public.users AS u
        WHERE
          u.id = $1;`;
        const [dbUser] = await query<{ email: string }>(getUserByIdSql, [res.body.user_id]);

        expect(dbUser.email).toBe(baseEmail);
      });

      test('"full_name" with leading and trailing whitespace is stored trimmed', async () => {
        const res = await getResponse({
          ...validRequestBody,
          email: faker.internet.email().toLowerCase(),
          full_name: '  John Doe  ',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.full_name).toBe('John Doe');
      });

      test('"known_as" with leading and trailing whitespace is stored trimmed', async () => {
        const res = await getResponse({
          ...validRequestBody,
          email: faker.internet.email().toLowerCase(),
          known_as: '  John  ',
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.known_as).toBe('John');
      });

      test('Omitting "known_as" persists null for the field', async () => {
        const {
          known_as: _knownAs,
          ...bodyWithoutKnownAs
        } = validRequestBody as Record<string, unknown>;
        const res = await getResponse({
          ...bodyWithoutKnownAs,
          email: faker.internet.email().toLowerCase(),
        } as RequestBody);

        expect(res.statusCode).toBe(201);
        expect(res.body.known_as).toBeNull();
      });
    });
  });

  describe('PUT /users/:user_id', () => {
    const getResponse = (userId: string, reqBody: RequestBody) => authAPI.put(`/users/${userId}`, reqBody);

    let validUserId: string;
    let validRequestBody: RequestBody;

    beforeAll(async () => {
      ({
        userId: validUserId,
      } = await createRandomUser());

      const firstName = faker.person.firstName().replace(/'/g, '');
      const lastName = faker.person.lastName().replace(/'/g, '');

      validRequestBody = {
        full_name: `${firstName} ${lastName}`,
        known_as: firstName,
      };
    });

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid', validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345', validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid, validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id');
      });

      test('Absent required body "full_name" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        delete reqBody.full_name;

        const res = await getResponse(validUserId, reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'full_name'`);
      });

      test('Invalid type body "full_name" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.full_name = 1234;

        const res = await getResponse(validUserId, reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/full_name must be string');
      });

      test('Empty string body "full_name" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.full_name = '';

        const res = await getResponse(validUserId, reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/full_name must NOT have fewer than 1 characters');
      });

      test('Empty string body "known_as" returns 400', async () => {
        const reqBody = _.cloneDeep(validRequestBody);
        reqBody.known_as = '';

        const res = await getResponse(validUserId, reqBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/known_as must NOT have fewer than 1 characters');
      });
    });

    describe('Request Success', () => {
      interface DbUser {
        user_id: string;
        full_name: string;
        known_as: string | null;
      }

      let rep: Supertest.Response;
      let dbUser: DbUser;
      let responseBody: DbUser;

      beforeAll(async () => {
        rep = await getResponse(validUserId, validRequestBody);

        const getUserSql = `SELECT
          u.id AS user_id
          , u.full_name
          , u.known_as
        FROM
          public.users AS u
        WHERE
          u.id = $1;`;
        const [result] = await query<DbUser>(getUserSql, [validUserId]);
        dbUser = result;

        ({
          body: responseBody,
        } = rep);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body has correct shape', () => {
        expect(responseBody).toHaveProperty('user_id');
        expect(responseBody).toHaveProperty('full_name');
        expect(responseBody).toHaveProperty('known_as');
      });

      test('Response "user_id" matches the user', () => {
        expect(responseBody.user_id).toBe(validUserId);
      });

      test('Response "full_name" matches request', () => {
        expect(responseBody.full_name).toBe(validRequestBody.full_name);
      });

      test('Response "known_as" matches request', () => {
        expect(responseBody.known_as).toBe(validRequestBody.known_as);
      });

      test('User data is persisted in the database', () => {
        expect(dbUser.full_name).toBe(validRequestBody.full_name);
        expect(dbUser.known_as).toBe(validRequestBody.known_as);
      });

      test('"full_name" with leading and trailing whitespace is stored trimmed', async () => {
        const res = await getResponse(validUserId, {
          ...validRequestBody,
          full_name: '  Jane Doe  ',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.full_name).toBe('Jane Doe');
      });

      test('"known_as" with leading and trailing whitespace is stored trimmed', async () => {
        const res = await getResponse(validUserId, {
          ...validRequestBody,
          known_as: '  Jane  ',
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.known_as).toBe('Jane');
      });

      test('Omitting "known_as" sets it to null', async () => {
        const {
          known_as: _knownAs,
          ...bodyWithoutKnownAs
        } = validRequestBody as Record<string, unknown>;
        const res = await getResponse(validUserId, bodyWithoutKnownAs as RequestBody);

        expect(res.statusCode).toBe(200);
        expect(res.body.known_as).toBeNull();
      });

      test('Sending "known_as: null" sets it to null', async () => {
        const res = await getResponse(validUserId, {
          ...(validRequestBody as Record<string, unknown>),
          known_as: null,
        } as unknown as RequestBody);

        expect(res.statusCode).toBe(200);
        expect(res.body.known_as).toBeNull();
      });
    });
  });

  describe('PATCH /users/:user_id/email', () => {
    const getResponse = (userId: string, reqBody: RequestBody) => authAPI.patch(`/users/${userId}/email`, reqBody);

    let validUserId: string;
    let validRequestBody = {} as RequestBody;

    beforeAll(async () => {
      ({
        userId: validUserId,
      } = await createRandomUser());

      validRequestBody = {
        new_email: faker.internet.email().toLowerCase(),
      };
    });

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid', validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345', validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid, validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id');
      });

      test('Absent required body "new_email" returns 400', async () => {
        const res = await getResponse(validUserId, {} as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'new_email'`);
      });

      test('Invalid type body "new_email" returns 400', async () => {
        const res = await getResponse(validUserId, { new_email: 1234 } as unknown as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/new_email must be string');
      });

      test('Invalid format body "new_email" returns 400', async () => {
        const res = await getResponse(validUserId, { new_email: 'not-an-email' } as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/new_email must match format "email"');
      });

      test('Duplicate "new_email" returns 400', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse(validUserId, { new_email: email } as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Supplied user email is not unique');
      });

      test('Duplicate "new_email" differing only by case returns 400', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse(validUserId, { new_email: email.toUpperCase() } as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Supplied user email is not unique');
      });

      test('Duplicate "new_email" differing only by whitespace returns 400', async () => {
        const {
          email,
        } = await createRandomUser();
        const res = await getResponse(validUserId, { new_email: `  ${email}  ` } as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Supplied user email is not unique');
      });
    });

    describe('Request Success', () => {
      interface DbUser {
        user_id: string;
        email: string;
      }

      let targetUserId: string;
      let rep: Supertest.Response;
      let dbUser: DbUser;
      let responseBody: DbUser;

      beforeAll(async () => {
        ({
          userId: targetUserId,
        } = await createRandomUser());

        rep = await getResponse(targetUserId, validRequestBody);

        const getUserSql = `SELECT
          u.id AS user_id
          , u.email
        FROM
          public.users AS u
        WHERE
          u.id = $1;`;
        const [result] = await query<DbUser>(getUserSql, [targetUserId]);
        dbUser = result;

        ({
          body: responseBody,
        } = rep);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body has correct shape', () => {
        expect(responseBody).toHaveProperty('user_id');
        expect(responseBody).toHaveProperty('email');
      });

      test('Response "user_id" matches the user', () => {
        expect(responseBody.user_id).toBe(targetUserId);
      });

      test('Response "email" matches request', () => {
        expect(responseBody.email).toBe(validRequestBody.new_email);
      });

      test('Email is persisted in the database', () => {
        expect(dbUser.email).toBe(validRequestBody.new_email);
      });

      test('Patching with the current email returns 200', async () => {
        const res = await getResponse(targetUserId, { new_email: validRequestBody.new_email } as RequestBody);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(validRequestBody.new_email);
      });

      test('"new_email" with mixed case and whitespace is normalized in response and database', async () => {
        const baseEmail = faker.internet.email().toLowerCase();
        const res = await getResponse(targetUserId, { new_email: `  ${baseEmail.toUpperCase()}  ` } as RequestBody);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(baseEmail);

        const getUserSql = `SELECT
          u.email
        FROM
          public.users AS u
        WHERE
          u.id = $1;`;
        const [dbResult] = await query<{ email: string }>(getUserSql, [targetUserId]);

        expect(dbResult.email).toBe(baseEmail);
      });
    });
  });

  describe('DELETE /users/:user_id', () => {
    const getResponse = (userId: string) => authAPI.del(`/users/${userId}`);

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with ACTIVE status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'ACTIVE' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with DEACTIVATED status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Already-deleted user returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'CREATED' });
        await getResponse(userId);

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });
    });

    describe('Request Success', () => {
      interface DbUser {
        id: string;
      }

      let createdUserId: string;
      let rep: Supertest.Response;

      beforeAll(async () => {
        ({
          userId: createdUserId,
        } = await createRandomUser({ status: 'CREATED' }));

        rep = await getResponse(createdUserId);
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Response body is empty', () => {
        expect(rep.body).toEqual({});
      });

      test('User is removed from the database', async () => {
        const getDeletedUserSql = `SELECT
          id
        FROM
          public.users
        WHERE
          id = $1;`;
        const [result] = await query<DbUser>(getDeletedUserSql, [createdUserId]);

        expect(result).toBeUndefined();
      });
    });
  });

  describe('PATCH /users/:user_id/invite', () => {
    const getResponse = (userId: string) => authAPI.patch(`/users/${userId}/invite`);

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';

        const res = await getResponse(unknownUuid);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with ACTIVE status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'ACTIVE' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });
    });

    describe('Request Success', () => {
      interface DbInvite {
        status: string;
        invite_token_hash: string | null;
        invite_token_expiry_at: Date | null;
      }

      const getInviteSql = `SELECT
        u.status
        , a.invite_token_hash
        , a.invite_token_expiry_at
      FROM
        public.users AS u
        INNER JOIN public.users_authentication AS a ON a.user_id = u.id
      WHERE
        u.id = $1;`;

      let createdUserId: string;
      let rep: Supertest.Response;
      let dbInvite: DbInvite;

      beforeAll(async () => {
        ({
          userId: createdUserId,
        } = await createRandomUser({ status: 'CREATED' }));

        rep = await getResponse(createdUserId);

        const [result] = await query<DbInvite>(getInviteSql, [createdUserId]);
        dbInvite = result;
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body has correct shape', () => {
        expect(rep.body).toHaveProperty('user_id');
        expect(rep.body).toHaveProperty('status');
      });

      test('Response "user_id" matches the user', () => {
        expect(rep.body.user_id).toBe(createdUserId);
      });

      test('Response "status" is "INVITED"', () => {
        expect(rep.body.status).toBe('INVITED');
      });

      test('User status is INVITED in the database', () => {
        expect(dbInvite.status).toBe('INVITED');
      });

      test('Invite token hash is persisted as a SHA-256 hex digest', () => {
        expect(dbInvite.invite_token_hash).toMatch(/^[0-9a-f]{64}$/);
      });

      test('Invite token expiry is set roughly seven days ahead', () => {
        expect(dbInvite.invite_token_expiry_at).not.toBeNull();

        const expiryDays = (new Date(dbInvite.invite_token_expiry_at as Date).getTime() - Date.now())
          / (1000 * 60 * 60 * 24);

        expect(expiryDays).toBeGreaterThan(6.5);
        expect(expiryDays).toBeLessThan(7.5);
      });

      test('Re-inviting an INVITED user returns 200 and rotates the token', async () => {
        const tokenSql = `SELECT
          a.invite_token_hash
        FROM
          public.users_authentication AS a
        WHERE
          a.user_id = $1;`;
        const [before] = await query<{ invite_token_hash: string }>(tokenSql, [createdUserId]);

        const res = await getResponse(createdUserId);
        const [after] = await query<{ invite_token_hash: string }>(tokenSql, [createdUserId]);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('INVITED');
        expect(after.invite_token_hash).not.toBe(before.invite_token_hash);
      });

      test('Inviting a DEACTIVATED user returns 200', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('INVITED');
      });
    });
  });

  describe('POST /users/activate', () => {
    const getResponse = (body: RequestBody) => noAuthAPI.post('/users/activate', body);

    const validPassword = 'TestPass123!@#abc';

    // Seed an INVITED user with a known token hash + expiry. Activation tokens
    // are only ever known to the email recipient in production, so an integration
    // test seeds the persisted hash directly to drive the activate endpoint.
    async function seedInvitedUserWithToken({
      rawToken,
      expiresAt,
    }: {
      rawToken: string;
      expiresAt?: Date;
    }) {
      const {
        userId,
      } = await createRandomUser({ status: 'INVITED' });

      const inviteTokenHash = sha256Hex(rawToken);
      const inviteExpiresAt = expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const updateUsersAuthenticationSql = `UPDATE
        public.users_authentication
      SET
        invite_token_hash = $1
        , invite_token_expiry_at = $2
      WHERE
        user_id = $3
      ;`;

      await query(updateUsersAuthenticationSql, [inviteTokenHash, inviteExpiresAt, userId]);

      return { userId };
    }

    describe('Request Failure', () => {
      test('Absent required body "token" returns 400', async () => {
        const res = await getResponse({ password: validPassword });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'token'`);
      });

      test('Absent required body "password" returns 400', async () => {
        const res = await getResponse({ token: 'some-token' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'password'`);
      });

      test('Invalid type body "token" returns 400', async () => {
        const res = await getResponse({
          token: 1234,
          password: validPassword,
        } as unknown as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/token must be string');
      });

      test('Invalid type body "password" returns 400', async () => {
        const res = await getResponse({
          token: 'some-token',
          password: 1234,
        } as unknown as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password must be string');
      });

      test('Password shorter than the minimum returns 400', async () => {
        const res = await getResponse({
          token: 'some-token',
          password: 'short',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password must NOT have fewer than 10 characters');
      });

      test('Password longer than the maximum returns 400', async () => {
        const res = await getResponse({
          token: 'some-token',
          password: 'a'.repeat(41),
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password must NOT have more than 40 characters');
      });

      test('Unknown token returns 400', async () => {
        const res = await getResponse({
          token: 'never-issued-token',
          password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid or expired invitation');
      });

      test('Expired token returns 400', async () => {
        const rawToken = `expired-${faker.string.alphanumeric(20)}`;
        await seedInvitedUserWithToken({
          rawToken,
          expiresAt: new Date(Date.now() - 1000),
        });

        const res = await getResponse({
          token: rawToken,
          password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid or expired invitation');
      });

      test('Already-used token returns 400 on the second activation', async () => {
        const rawToken = `used-${faker.string.alphanumeric(20)}`;
        await seedInvitedUserWithToken({ rawToken });

        const first = await getResponse({
          token: rawToken,
          password: validPassword,
        });
        const second = await getResponse({
          token: rawToken,
          password: validPassword,
        });

        expect(first.statusCode).toBe(204);
        expect(second.statusCode).toBe(400);
        expect(second.body.message).toBe('Invalid or expired invitation');
      });
    });

    describe('Request Success', () => {
      interface DbActivated {
        status: string;
        password_hash: string | null;
        invite_token_hash: string | null;
        invite_token_expiry_at: Date | null;
      }

      const getActivatedSql = `SELECT
        u.status
        , a.password_hash
        , a.invite_token_hash
        , a.invite_token_expiry_at
      FROM
        public.users AS u
        INNER JOIN public.users_authentication AS a ON a.user_id = u.id
      WHERE
        u.id = $1;`;

      let activatedUserId: string;
      let rawToken: string;
      let rep: Supertest.Response;
      let dbActivated: DbActivated;

      beforeAll(async () => {
        rawToken = `valid-${faker.string.alphanumeric(20)}`;
        ({
          userId: activatedUserId,
        } = await seedInvitedUserWithToken({ rawToken }));

        rep = await getResponse({
          token: rawToken,
          password: validPassword,
        });

        const [result] = await query<DbActivated>(getActivatedSql, [activatedUserId]);
        dbActivated = result;
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Response body is empty', () => {
        expect(rep.body).toEqual({});
      });

      test('User status is ACTIVE in the database', () => {
        expect(dbActivated.status).toBe('ACTIVE');
      });

      test('Password is persisted as a bcrypt hash of the supplied password', async () => {
        expect(dbActivated.password_hash).not.toBeNull();
        expect(await bcrypt.compare(validPassword, dbActivated.password_hash as string)).toBe(true);
      });

      test('Invite token hash is cleared in the database', () => {
        expect(dbActivated.invite_token_hash).toBeNull();
      });

      test('Invite token expiry is cleared in the database', () => {
        expect(dbActivated.invite_token_expiry_at).toBeNull();
      });
    });
  });

  describe('PATCH /users/:user_id/deactivate', () => {
    const getResponse = (userId: string) => authAPI.patch(`/users/${userId}/deactivate`);

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';

        const res = await getResponse(unknownUuid);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with CREATED status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'CREATED' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with INVITED status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'INVITED' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with DEACTIVATED status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Already-deactivated user returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'ACTIVE' });
        await getResponse(userId);

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });
    });

    describe('Request Success', () => {
      interface DbUser {
        id: string;
        status: string;
        password_hash: string;
        refresh_token_hash: string | null;
      }

      let activeUserId: string;
      let originalPasswordHash: string;
      let rep: Supertest.Response;
      let dbUser: DbUser;

      beforeAll(async () => {
        ({
          userId: activeUserId,
        } = await createRandomUser({ status: 'ACTIVE' }));

        const getUserSql = `SELECT
          u.id
          , u.status
          , a.password_hash
          , a.refresh_token_hash
        FROM
          public.users AS u
          INNER JOIN public.users_authentication AS a ON a.user_id = u.id
        WHERE
          u.id = $1;`;
        const [original] = await query<DbUser>(getUserSql, [activeUserId]);
        originalPasswordHash = original.password_hash;

        rep = await getResponse(activeUserId);

        const [result] = await query<DbUser>(getUserSql, [activeUserId]);
        dbUser = result;
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response body has correct shape', () => {
        expect(rep.body).toHaveProperty('user_id');
        expect(rep.body).toHaveProperty('status');
      });

      test('Response "user_id" matches the user', () => {
        expect(rep.body.user_id).toBe(activeUserId);
      });

      test('Response "status" is "DEACTIVATED"', () => {
        expect(rep.body.status).toBe('DEACTIVATED');
      });

      test('User status is DEACTIVATED in the database', () => {
        expect(dbUser.status).toBe('DEACTIVATED');
      });

      test('User password_hash is invalidated in the database', () => {
        expect(dbUser.password_hash).not.toBe(originalPasswordHash);
      });

      test('User refresh_token_hash is null in the database', () => {
        expect(dbUser.refresh_token_hash).toBeNull();
      });
    });
  });
});
