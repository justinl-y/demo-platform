import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
import _ from 'lodash';
import { faker } from '@faker-js/faker/locale/en';

import { query } from '../lib/db.ts';
import { authAPI } from '../lib/api.ts';
import {
  createRandomUser,
  getFileNumber,
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
        id: string;
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

        const getUserByIdSql = 'SELECT u.id, u.email, u.full_name, u.known_as, u.status FROM public.users AS u WHERE u.id = $1';
        const [result] = await query<DbUser>(getUserByIdSql, [rep.body.id]);

        dbUser = result;

        ({
          body: responseBody,
        } = rep);
      });

      test('Success response returns 201', () => {
        expect(rep.statusCode).toBe(201);
      });

      test('Response body has correct shape', () => {
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('email');
        expect(responseBody).toHaveProperty('full_name');
        expect(responseBody).toHaveProperty('known_as');
        expect(responseBody).toHaveProperty('status');
      });

      test('Response "id" is a UUID', () => {
        expect(responseBody.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
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

        const getUserByIdSql = 'SELECT u.email FROM public.users AS u WHERE u.id = $1';
        const [dbUser] = await query<{ email: string }>(getUserByIdSql, [res.body.id]);

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
        const getDeletedUserSql = 'SELECT id FROM public.users WHERE id = $1';
        const [result] = await query<DbUser>(getDeletedUserSql, [createdUserId]);

        expect(result).toBeUndefined();
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
        id: string;
        full_name: string;
        known_as: string | null;
      }

      let rep: Supertest.Response;
      let dbUser: DbUser;
      let responseBody: DbUser;

      beforeAll(async () => {
        rep = await getResponse(validUserId, validRequestBody);

        const getUserSql = 'SELECT u.id, u.full_name, u.known_as FROM public.users AS u WHERE u.id = $1';
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
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('full_name');
        expect(responseBody).toHaveProperty('known_as');
      });

      test('Response "id" matches the user', () => {
        expect(responseBody.id).toBe(validUserId);
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

  describe('PATCH /users/deactivate/:userId', () => {
    const getResponse = (userId: string) => authAPI.patch(`/users/deactivate/${userId}`);

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
        token_refresh_hash: string | null;
      }

      let activeUserId: string;
      let originalPasswordHash: string;
      let rep: Supertest.Response;
      let dbUser: DbUser;

      beforeAll(async () => {
        ({
          userId: activeUserId,
        } = await createRandomUser({ status: 'ACTIVE' }));

        const getUserSql = 'SELECT u.id, u.status, u.password_hash, u.token_refresh_hash FROM public.users AS u WHERE u.id = $1';
        const [original] = await query<DbUser>(getUserSql, [activeUserId]);
        originalPasswordHash = original.password_hash;

        rep = await getResponse(activeUserId);

        const [result] = await query<DbUser>(getUserSql, [activeUserId]);
        dbUser = result;
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Response body is empty', () => {
        expect(rep.body).toEqual({});
      });

      test('User status is DEACTIVATED in the database', () => {
        expect(dbUser.status).toBe('DEACTIVATED');
      });

      test('User password_hash is invalidated in the database', () => {
        expect(dbUser.password_hash).not.toBe(originalPasswordHash);
      });

      test('User token_refresh_hash is null in the database', () => {
        expect(dbUser.token_refresh_hash).toBeNull();
      });
    });
  });
});
