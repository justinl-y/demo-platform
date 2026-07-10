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
import { authAPISuper, noAuthAPI } from '../lib/api.ts';
import {
  createRandomUser,
  getFileNumber,
  sha256Hex,
} from '../lib/functions.ts';

import type Supertest from 'supertest';
import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

interface SeededRole {
  role_id: string;
  role_name: string;
}

// GET /internal-users/roles has no write route yet, so the role-assignment tests seed
// internal.roles and the internal.users_roles join table directly.
async function createRandomRole({
  name: nameOverride,
}: { name?: string } = {}): Promise<SeededRole> {
  const name = nameOverride ?? `TEST_ROLE_${faker.string.alphanumeric(16).toUpperCase()}`;

  const insertSql = `INSERT INTO internal.roles
      (name, description)
    VALUES
      ($1, $2)
    RETURNING
      id AS role_id
      , name AS role_name;`;

  const [role] = await query<SeededRole>(insertSql, [
    name,
    faker.lorem.sentence(),
  ]);

  expect(role, 'failed to seed test role').toBeDefined();

  return role;
}

async function assignRoleToUser(userId: string, roleId: string): Promise<void> {
  const insertSql = `INSERT INTO internal.users_roles
      (user_id, role_id)
    VALUES
      ($1, $2)
    ON CONFLICT (user_id, role_id) DO NOTHING;`;

  await query(insertSql, [userId, roleId]);
}

describe(`${fileNumber} - Internal Users`, () => {
  describe('GET /internal-users - all', () => {
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

    const getResponse = () => authAPISuper.get('/internal-users');

    describe('Request Failure', () => {
      test('"status" with invalid value returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?status=invalid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('querystring/status');
      });

      test('"page" of "0" returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?page=0');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
      });

      test('"page" of non-numeric string returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?page=abc');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
      });

      test('"per_page" of "0" returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?per_page=0');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });

      test('"per_page" of "101" returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?per_page=101');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });

      test('"per_page" of non-numeric string returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?per_page=abc');

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
        expect(rep.body).toHaveProperty('data');
        expect(rep.body).toHaveProperty('pagination');
        expect(rep.body.data).toBeTypeOf('object');
        expect(Array.isArray(rep.body.data)).toBe(true);
        expect(rep.body.pagination.count_page).toBeTypeOf('number');
        expect(rep.body.pagination.count_total).toBeTypeOf('number');
        expect(rep.body.pagination).toHaveProperty('page');
        expect(rep.body.pagination).toHaveProperty('pages');
      });

      test('Response entries have correct shape', () => {
        const user = rep.body.data.find((u: { user_id: string }) => u.user_id === activeUserId);

        if (!user) throw new Error('user missing from response');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('full_name');
        expect(user).toHaveProperty('known_as');
        expect(user).toHaveProperty('status');
        expect(user.status).toBeTypeOf('string');
      });

      test('"status=ACTIVE&status=DEACTIVATED" returns both active and deactivated users', async () => {
        const res = await authAPISuper.get('/internal-users?status=ACTIVE&status=DEACTIVATED');

        expect(res.body.data.find((u: { user_id: string }) => u.user_id === activeUserId)).toBeDefined();
        expect(res.body.data.find((u: { user_id: string }) => u.user_id === deactivatedUserId)).toBeDefined();
      });

      test('"status=ACTIVE" returns only active users', async () => {
        const res = await authAPISuper.get('/internal-users?status=ACTIVE');

        expect(res.body.data.find((u: { user_id: string }) => u.user_id === activeUserId)).toBeDefined();
        expect(res.body.data.find((u: { user_id: string }) => u.user_id === deactivatedUserId)).toBeUndefined();
      });

      test('"status=DEACTIVATED" returns only deactivated users', async () => {
        const res = await authAPISuper.get('/internal-users?status=DEACTIVATED');

        expect(res.body.data.find((u: { user_id: string }) => u.user_id === activeUserId)).toBeUndefined();
        expect(res.body.data.find((u: { user_id: string }) => u.user_id === deactivatedUserId)).toBeDefined();
      });

      test('"per_page=1" returns exactly one user', async () => {
        const res = await authAPISuper.get('/internal-users?per_page=1');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((u: { user_id: string }) => u.user_id)).toHaveLength(1);
        expect(res.body.pagination.count_page).toBe(1);
        expect(res.body.pagination.count_total).toBe(res.body.pagination.pages);
        expect(res.body.pagination.pages).toBeGreaterThanOrEqual(1);
      });

      test('page=1 and page=2 with per_page=1 return different users', async () => {
        const [res1, res2] = await Promise.all([
          authAPISuper.get('/internal-users?per_page=1&page=1'),
          authAPISuper.get('/internal-users?per_page=1&page=2'),
        ]);

        expect(res1.body.data.map((u: { user_id: string }) => u.user_id)).toHaveLength(1);
        expect(res2.body.data.map((u: { user_id: string }) => u.user_id)).toHaveLength(1);
        expect(res1.body.data.map((u: { user_id: string }) => u.user_id)[0]).not.toBe(res2.body.data.map((u: { user_id: string }) => u.user_id)[0]);
      });

      test('"page=9999" returns empty data with count 0', async () => {
        const res = await authAPISuper.get('/internal-users?page=9999&per_page=100');

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.count_page).toBe(0);
        expect(res.body.pagination.count_total).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /internal-users - search, sort & order', () => {
    // Two users sharing a unique token in their email so a search isolates them
    // from every other seeded user, with emails that sort predictably against
    // each other. The token is prefixed with a non-hex letter so it can never be
    // a substring of any user's UUID (which the search also matches on).
    let token: string;
    let userIdLow: string; // email aaa-<token> — sorts first ascending
    let userIdHigh: string; // email zzz-<token> — sorts last ascending

    beforeAll(async () => {
      token = `s${faker.string.alphanumeric(11)}`.toLowerCase();

      ({
        userId: userIdLow,
      } = await createRandomUser({ email: `aaa-${token}@example.com` }));

      ({
        userId: userIdHigh,
      } = await createRandomUser({ email: `zzz-${token}@example.com` }));
    });

    describe('Request Failure', () => {
      test('"sort" with invalid value returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?sort=invalid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('querystring/sort');
      });

      test('"order" with invalid value returns 400', async () => {
        const res = await authAPISuper.get('/internal-users?order=invalid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain('querystring/order');
      });
    });

    describe('Request Success', () => {
      test('"search" by email substring returns only the matching users', async () => {
        const res = await authAPISuper.get(`/internal-users?search=${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((u: { user_id: string }) => u.user_id).sort()).toEqual([userIdLow, userIdHigh].sort());
        expect(res.body.pagination.count_page).toBe(2);
        expect(res.body.pagination.count_total).toBe(2);
      });

      test('"search" by user_id returns that single user', async () => {
        const res = await authAPISuper.get(`/internal-users?search=${userIdLow}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((u: { user_id: string }) => u.user_id)).toEqual([userIdLow]);
        expect(res.body.pagination.count_page).toBe(1);
        expect(res.body.pagination.count_total).toBe(1);
      });

      test('"search" with no match returns empty data and count 0', async () => {
        const res = await authAPISuper.get('/internal-users?search=no-such-user-zzzzzzzz');

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.count_page).toBe(0);
        expect(res.body.pagination.count_total).toBe(0);
      });

      test('"sort=email&order=ASC" returns matched users ascending by email', async () => {
        const res = await authAPISuper.get(`/internal-users?search=${token}&sort=email&order=ASC`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((u: { user_id: string }) => u.user_id)).toEqual([userIdLow, userIdHigh]);
      });

      test('"sort=email&order=DESC" returns matched users descending by email', async () => {
        const res = await authAPISuper.get(`/internal-users?search=${token}&sort=email&order=DESC`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((u: { user_id: string }) => u.user_id)).toEqual([userIdHigh, userIdLow]);
      });
    });
  });

  describe('POST /internal-users', () => {
    const getResponse = (reqBody: RequestBody) => authAPISuper.post('/internal-users', reqBody);

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
          internal.users AS u
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
          internal.users AS u
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

  describe('PUT /internal-users/:user_id', () => {
    const getResponse = (userId: string, reqBody: RequestBody) => authAPISuper.put(`/internal-users/${userId}`, reqBody);

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
          internal.users AS u
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

  describe('PATCH /internal-users/:user_id/email', () => {
    const getResponse = (userId: string, reqBody: RequestBody) => authAPISuper.patch(`/internal-users/${userId}/email`, reqBody);

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
          internal.users AS u
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
          internal.users AS u
        WHERE
          u.id = $1;`;
        const [dbResult] = await query<{ email: string }>(getUserSql, [targetUserId]);

        expect(dbResult.email).toBe(baseEmail);
      });
    });
  });

  describe('DELETE /internal-users/:user_id', () => {
    const getResponse = (userId: string) => authAPISuper.del(`/internal-users/${userId}`);

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
          internal.users
        WHERE
          id = $1;`;
        const [result] = await query<DbUser>(getDeletedUserSql, [createdUserId]);

        expect(result).toBeUndefined();
      });
    });
  });

  describe('GET /internal-users/roles - all', () => {
    beforeAll(async () => {
      const {
        userId,
      } = await createRandomUser();
      const role = await createRandomRole();
      await assignRoleToUser(userId, role.role_id);
    });

    const getResponse = () => authAPISuper.get('/internal-users/roles');

    describe('Request Failure', () => {
      test('"page" of "0" returns 400', async () => {
        const res = await authAPISuper.get('/internal-users/roles?page=0');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
      });

      test('"page" of non-numeric string returns 400', async () => {
        const res = await authAPISuper.get('/internal-users/roles?page=abc');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
      });

      test('"per_page" of "0" returns 400', async () => {
        const res = await authAPISuper.get('/internal-users/roles?per_page=0');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });

      test('"per_page" of "101" returns 400', async () => {
        const res = await authAPISuper.get('/internal-users/roles?per_page=101');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
      });

      test('"user_id" of non-UUID returns 400', async () => {
        const res = await authAPISuper.get('/internal-users/roles?user_id=not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/user_id must match format "uuid"');
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
        expect(rep.body).toHaveProperty('data');
        expect(rep.body).toHaveProperty('pagination');
        expect(rep.body.data).toBeTypeOf('object');
        expect(Array.isArray(rep.body.data)).toBe(true);
        expect(rep.body.pagination.count_page).toBeTypeOf('number');
        expect(rep.body.pagination.count_total).toBeTypeOf('number');
        expect(rep.body.pagination).toHaveProperty('page');
        expect(rep.body.pagination).toHaveProperty('pages');
      });

      test('Response entries have correct shape', () => {
        const [entry] = rep.body.data as Array<Record<string, unknown>>;

        expect(entry).toBeDefined();
        expect(entry).toHaveProperty('user_id');
        expect(entry).toHaveProperty('user_email');
        expect(entry).toHaveProperty('user_full_name');
        expect(entry.user_full_name).toBeTypeOf('string');
        expect(entry).toHaveProperty('roles');
        expect(entry.roles).toBeTypeOf('object');
        expect(Array.isArray(entry.roles)).toBe(false);
      });

      test('"per_page=1" returns exactly one user', async () => {
        const res = await authAPISuper.get('/internal-users/roles?per_page=1');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((u: { user_id: string }) => u.user_id)).toHaveLength(1);
        expect(res.body.pagination.count_page).toBe(1);
        expect(res.body.pagination.count_total).toBe(res.body.pagination.pages);
        expect(res.body.pagination.pages).toBeGreaterThanOrEqual(1);
      });

      test('"page=9999" returns empty data with count 0', async () => {
        const res = await authAPISuper.get('/internal-users/roles?page=9999&per_page=100');

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.count_page).toBe(0);
        expect(res.body.pagination.count_total).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /internal-users/roles - single', () => {
    let userWithRolesId: string;
    let userWithRolesEmail: string;
    let userWithoutRolesId: string;
    let roleOne: SeededRole;
    let roleTwo: SeededRole;

    beforeAll(async () => {
      ({
        userId: userWithRolesId, email: userWithRolesEmail,
      } = await createRandomUser());

      ({
        userId: userWithoutRolesId,
      } = await createRandomUser());

      roleOne = await createRandomRole();
      roleTwo = await createRandomRole();
      await assignRoleToUser(userWithRolesId, roleOne.role_id);
      await assignRoleToUser(userWithRolesId, roleTwo.role_id);
    });

    const getResponse = (userId: string) => authAPISuper.get(`/internal-users/roles?user_id=${userId}`);

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('querystring/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 200 with empty data and count 0', async () => {
        const res = await getResponse('00000000-0000-0000-0000-000000000000');

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.count_page).toBe(0);
        expect(res.body.pagination.count_total).toBe(0);
      });
    });

    describe('Request Success', () => {
      let rep: Supertest.Response;

      beforeAll(async () => {
        rep = await getResponse(userWithRolesId);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response contains only the requested user', () => {
        expect(rep.body.data.map((u: { user_id: string }) => u.user_id)).toEqual([userWithRolesId]);
        expect(rep.body.pagination.count_page).toBe(1);
        expect(rep.body.pagination.count_total).toBe(1);
      });

      test('Response entry has correct shape', () => {
        const user = rep.body.data.find((u: { user_id: string }) => u.user_id === userWithRolesId);

        if (!user) throw new Error('user missing from response');
        expect(user.user_id).toBe(userWithRolesId);
        expect(user.user_email).toBe(userWithRolesEmail);
        expect(user.user_full_name).toBeTypeOf('string');
        expect(user.roles).toBeTypeOf('object');
        expect(Array.isArray(user.roles)).toBe(false);
      });

      test('Assigned roles are keyed by role id with id and name', () => {
        const user = rep.body.data.find((u: { user_id: string }) => u.user_id === userWithRolesId);

        if (!user) throw new Error('user missing from response');
        const {
          roles,
        } = user;

        expect(Object.keys(roles)).toHaveLength(2);
        expect(roles[roleOne.role_id]).toEqual({
          role_id: roleOne.role_id,
          role_name: roleOne.role_name,
        });
        expect(roles[roleTwo.role_id]).toEqual({
          role_id: roleTwo.role_id,
          role_name: roleTwo.role_name,
        });
      });

      test('A user with no assigned roles has an empty roles object', async () => {
        const res = await getResponse(userWithoutRolesId);

        expect(res.statusCode).toBe(200);
        const user = res.body.data.find((u: { user_id: string }) => u.user_id === userWithoutRolesId);

        if (!user) throw new Error('user missing from response');
        expect(user.roles).toEqual({});
      });

      test('Assigned roles are ordered by role name ascending', async () => {
        const token = `Q${faker.string.alphanumeric(11).toUpperCase()}`;
        const {
          userId,
        } = await createRandomUser();

        // Seeded/assigned in reverse name order so a pass proves name ordering
        // rather than insertion order.
        const roleHigh = await createRandomRole({ name: `ZZZ_${token}` });
        const roleLow = await createRandomRole({ name: `AAA_${token}` });
        await assignRoleToUser(userId, roleHigh.role_id);
        await assignRoleToUser(userId, roleLow.role_id);

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(200);
        const user = res.body.data.find((u: { user_id: string }) => u.user_id === userId);

        if (!user) throw new Error('user missing from response');
        expect(Object.keys(user.roles)).toEqual([roleLow.role_id, roleHigh.role_id]);
      });
    });
  });

  describe('POST /internal-users/:user_id/roles', () => {
    const getResponse = (userId: string, reqBody: Record<string, unknown>) => authAPISuper.post(`/internal-users/${userId}/roles`, reqBody);

    let validUserId: string;
    let seededRole: SeededRole;
    let validRequestBody: Record<string, unknown>;

    beforeAll(async () => {
      ({
        userId: validUserId,
      } = await createRandomUser());

      seededRole = await createRandomRole();

      validRequestBody = {
        roles: [seededRole.role_id],
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

      test('Absent required body "roles" returns 400', async () => {
        const res = await getResponse(validUserId, {});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'roles'`);
      });

      test('Empty "roles" array returns 400', async () => {
        const res = await getResponse(validUserId, { roles: [] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/roles must NOT have fewer than 1 items');
      });

      test('Non-UUID "roles" item returns 400', async () => {
        const res = await getResponse(validUserId, { roles: ['not-a-uuid'] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/roles/0 must match format "uuid"');
      });

      test('Duplicate "roles" items return 400', async () => {
        const res = await getResponse(validUserId, { roles: [seededRole.role_id, seededRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/roles must NOT have duplicate items (items ## 1 and 0 are identical)');
      });

      test('Unknown user UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid, validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Deactivated user returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await getResponse(userId, validRequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Unknown role id returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(validUserId, { roles: [unknownUuid] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('One or more supplied role ids are invalid');
      });

      test('User with existing roles returns 400 and assigns nothing new', async () => {
        const {
          userId,
        } = await createRandomUser();
        const existingRole = await createRandomRole();
        const newRole = await createRandomRole();
        await assignRoleToUser(userId, existingRole.role_id);

        const res = await getResponse(userId, { roles: [newRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User roles already exist');

        // The user's role set must be untouched — no new role assigned.
        const getUserRolesSql = `SELECT
          ur.role_id
        FROM
          internal.users_roles AS ur
        WHERE
          ur.user_id = $1;`;
        const rows = await query<{ role_id: string }>(getUserRolesSql, [userId]);
        const assignedRoleIds = rows.map((row) => row.role_id);

        expect(assignedRoleIds).toEqual([existingRole.role_id]);
        expect(assignedRoleIds).not.toContain(newRole.role_id);
      });
    });

    describe('Request Success', () => {
      interface DbUserRole {
        role_id: string;
      }

      const getUserRolesSql = `SELECT
        ur.role_id
      FROM
        internal.users_roles AS ur
      WHERE
        ur.user_id = $1
      ORDER BY
        ur.role_id;`;

      let targetUserId: string;
      let roleOne: SeededRole;
      let roleTwo: SeededRole;
      let rep: Supertest.Response;
      let dbRoleIds: string[];

      beforeAll(async () => {
        ({
          userId: targetUserId,
        } = await createRandomUser());

        roleOne = await createRandomRole();
        roleTwo = await createRandomRole();

        rep = await getResponse(targetUserId, { roles: [roleOne.role_id, roleTwo.role_id] });

        const result = await query<DbUserRole>(getUserRolesSql, [targetUserId]);
        dbRoleIds = result.map((row) => row.role_id);
      });

      test('Success response returns 201', () => {
        expect(rep.statusCode).toBe(201);
      });

      test('Response body has correct shape', () => {
        expect(rep.body).toHaveProperty('user_id');
        expect(rep.body).toHaveProperty('roles');
        expect(Array.isArray(rep.body.roles)).toBe(true);
      });

      test('Response "user_id" matches the user', () => {
        expect(rep.body.user_id).toBe(targetUserId);
      });

      test('Response "roles" contains the assigned role ids', () => {
        expect(rep.body.roles).toHaveLength(2);
        expect(rep.body.roles).toContain(roleOne.role_id);
        expect(rep.body.roles).toContain(roleTwo.role_id);
      });

      test('Assignments are persisted in the database', () => {
        expect(dbRoleIds).toContain(roleOne.role_id);
        expect(dbRoleIds).toContain(roleTwo.role_id);
      });

      test('Assigning a single role to a user returns 201', async () => {
        const {
          userId,
        } = await createRandomUser();
        const role = await createRandomRole();

        const res = await getResponse(userId, { roles: [role.role_id] });

        expect(res.statusCode).toBe(201);
        expect(res.body.roles).toEqual([role.role_id]);
      });
    });
  });

  describe('PUT /internal-users/:user_id/roles', () => {
    const getResponse = (userId: string, reqBody: Record<string, unknown>) => authAPISuper.put(`/internal-users/${userId}/roles`, reqBody);

    const getUserRolesSql = `SELECT
      ur.role_id
    FROM
      internal.users_roles AS ur
    WHERE
      ur.user_id = $1;`;

    let validUserId: string;
    let seededRole: SeededRole;

    beforeAll(async () => {
      ({
        userId: validUserId,
      } = await createRandomUser());

      seededRole = await createRandomRole();
    });

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid', { roles: [seededRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await getResponse('12345', { roles: [seededRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Absent required body "roles" returns 400', async () => {
        const res = await getResponse(validUserId, {});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'roles'`);
      });

      test('Non-UUID "roles" item returns 400', async () => {
        const res = await getResponse(validUserId, { roles: ['not-a-uuid'] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/roles/0 must match format "uuid"');
      });

      test('Duplicate "roles" items return 400', async () => {
        const res = await getResponse(validUserId, { roles: [seededRole.role_id, seededRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/roles must NOT have duplicate items (items ## 1 and 0 are identical)');
      });

      test('Unknown user UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(unknownUuid, { roles: [seededRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Deactivated user returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await getResponse(userId, { roles: [seededRole.role_id] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Unknown role id returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';
        const res = await getResponse(validUserId, { roles: [unknownUuid] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('One or more supplied role ids are invalid');
      });
    });

    describe('Request Success', () => {
      test('Replaces the existing role set (old removed, new present)', async () => {
        const {
          userId,
        } = await createRandomUser();
        const oldRole = await createRandomRole();
        const newRoleOne = await createRandomRole();
        const newRoleTwo = await createRandomRole();
        await assignRoleToUser(userId, oldRole.role_id);

        const res = await getResponse(userId, { roles: [newRoleOne.role_id, newRoleTwo.role_id] });

        expect(res.statusCode).toBe(200);
        expect([...res.body.roles].sort()).toEqual([newRoleOne.role_id, newRoleTwo.role_id].sort());

        const rows = await query<{ role_id: string }>(getUserRolesSql, [userId]);
        const assignedRoleIds = rows.map((row) => row.role_id);

        expect(assignedRoleIds).toContain(newRoleOne.role_id);
        expect(assignedRoleIds).toContain(newRoleTwo.role_id);
        expect(assignedRoleIds).not.toContain(oldRole.role_id);
      });

      test('An empty "roles" array removes all of the user\'s roles', async () => {
        const {
          userId,
        } = await createRandomUser();
        const roleOne = await createRandomRole();
        const roleTwo = await createRandomRole();
        await assignRoleToUser(userId, roleOne.role_id);
        await assignRoleToUser(userId, roleTwo.role_id);

        const res = await getResponse(userId, { roles: [] });

        expect(res.statusCode).toBe(200);
        expect(res.body.roles).toEqual([]);

        const rows = await query<{ role_id: string }>(getUserRolesSql, [userId]);

        expect(rows).toHaveLength(0);
      });

      test('Setting roles on a user that has none returns 200', async () => {
        const {
          userId,
        } = await createRandomUser();
        const role = await createRandomRole();

        const res = await getResponse(userId, { roles: [role.role_id] });

        expect(res.statusCode).toBe(200);
        expect(res.body.roles).toEqual([role.role_id]);
      });
    });
  });

  describe('DELETE /internal-users/:user_id/roles', () => {
    const getResponse = (userId: string) => authAPISuper.del(`/internal-users/${userId}/roles`);

    const getUserRolesSql = `SELECT
      ur.role_id
    FROM
      internal.users_roles AS ur
    WHERE
      ur.user_id = $1;`;

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

      test('Unknown user UUID returns 400', async () => {
        const res = await getResponse('00000000-0000-0000-0000-000000000000');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('Deactivated user returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await getResponse(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });
    });

    describe('Request Success', () => {
      let userId: string;
      let rep: Supertest.Response;

      beforeAll(async () => {
        ({
          userId,
        } = await createRandomUser());
        const roleOne = await createRandomRole();
        const roleTwo = await createRandomRole();
        await assignRoleToUser(userId, roleOne.role_id);
        await assignRoleToUser(userId, roleTwo.role_id);

        rep = await getResponse(userId);
      });

      test('Success response returns 204', () => {
        expect(rep.statusCode).toBe(204);
      });

      test('Response body is empty', () => {
        expect(rep.body).toEqual({});
      });

      test('All of the user\'s roles are removed from the database', async () => {
        const rows = await query<{ role_id: string }>(getUserRolesSql, [userId]);

        expect(rows).toHaveLength(0);
      });

      test('Deleting roles from a user that has none returns 204', async () => {
        const {
          userId: noRolesUserId,
        } = await createRandomUser();

        const res = await getResponse(noRolesUserId);

        expect(res.statusCode).toBe(204);
      });
    });
  });

  describe('PATCH /internal-users/:user_id/invite', () => {
    const getResponse = (userId: string) => authAPISuper.patch(`/internal-users/${userId}/invite`);

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
        invite_email_sent_at: Date | null;
      }

      const getInviteSql = `SELECT
        u.status
        , a.invite_token_hash
        , a.invite_token_expiry_at
        , a.invite_email_sent_at
      FROM
        internal.users AS u
        INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
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
        expect(rep.body).toHaveProperty('invite_email_sent');
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

      test('Response "invite_email_sent" is true', () => {
        expect(rep.body.invite_email_sent).toBe(true);
      });

      test('Email "invite_email_sent_at" is persisted in the database', () => {
        expect(dbInvite.invite_email_sent_at).not.toBeNull();
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
          internal.users_authentication AS a
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

    describe('Email delivery failure', () => {
      interface DbInvite {
        invite_token_hash: string | null;
        invite_token_expiry_at: Date | null;
        invite_email_sent_at: Date | null;
      }

      const getInviteSql = `SELECT
        a.invite_token_hash
        , a.invite_token_expiry_at
        , a.invite_email_sent_at
      FROM
        internal.users_authentication AS a
      WHERE
        a.user_id = $1;`;

      let failUserId: string;
      let rep: Supertest.Response;
      let dbInvite: DbInvite;

      // The mailer test seam in src/lib/mailer.ts throws on this sentinel domain (RFC 2606 .test TLD).
      const failEmail = `fail-${faker.string.alphanumeric(10).toLowerCase()}@mailer-fail.test`;

      beforeAll(async () => {
        ({
          userId: failUserId,
        } = await createRandomUser({
          status: 'CREATED',
          email: failEmail,
        }));

        rep = await getResponse(failUserId);

        const [result] = await query<DbInvite>(getInviteSql, [failUserId]);
        dbInvite = result;
      });

      test('Response returns 200 even when the email delivery fails', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response "status" is still "INVITED"', () => {
        expect(rep.body.status).toBe('INVITED');
      });

      test('Response "invite_email_sent" is false', () => {
        expect(rep.body.invite_email_sent).toBe(false);
      });

      test('Invitation row is still persisted on email failure', () => {
        expect(dbInvite.invite_token_hash).toMatch(/^[0-9a-f]{64}$/);
        expect(dbInvite.invite_token_expiry_at).not.toBeNull();
      });

      test('Database "invite_email_sent_at" remains NULL on failure', () => {
        expect(dbInvite.invite_email_sent_at).toBeNull();
      });
    });
  });

  describe('DELETE /internal-users/:user_id/invite', () => {
    const cancelInvite = (userId: string) => authAPISuper.del(`/internal-users/${userId}/invite`);

    describe('Request Failure', () => {
      test('Non-UUID "user_id" returns 400', async () => {
        const res = await cancelInvite('not-a-uuid');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Integer "user_id" returns 400', async () => {
        const res = await cancelInvite('12345');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/user_id must match format "uuid"');
      });

      test('Unknown UUID returns 400', async () => {
        const unknownUuid = '00000000-0000-0000-0000-000000000000';

        const res = await cancelInvite(unknownUuid);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with CREATED status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'CREATED' });

        const res = await cancelInvite(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with ACTIVE status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'ACTIVE' });

        const res = await cancelInvite(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });

      test('User with DEACTIVATED status returns 400', async () => {
        const {
          userId,
        } = await createRandomUser({ status: 'DEACTIVATED' });

        const res = await cancelInvite(userId);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid user id or user status');
      });
    });

    describe('Request Success', () => {
      interface DbInvite {
        status: string;
        invite_token_hash: string | null;
        invite_token_expiry_at: Date | null;
        invite_email_sent_at: Date | null;
      }

      const getInviteSql = `SELECT
        u.status
        , a.invite_token_hash
        , a.invite_token_expiry_at
        , a.invite_email_sent_at
      FROM
        internal.users AS u
        INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
      WHERE
        u.id = $1;`;

      let invitedUserId: string;
      let rep: Supertest.Response;
      let dbInvite: DbInvite;

      beforeAll(async () => {
        ({
          userId: invitedUserId,
        } = await createRandomUser({ status: 'INVITED' }));

        // Seed the auth row so the "field was cleared" assertions are meaningful
        // (NULL → NULL would otherwise pass trivially). Values are arbitrary —
        // the cancel SQL doesn't validate them, only nulls them.
        const seedAuthSql = `UPDATE
          internal.users_authentication
        SET
          invite_token_hash = $1
          , invite_token_expiry_at = $2
          , invite_email_sent_at = $3
        WHERE
          user_id = $4
        ;`;

        await query(seedAuthSql, [
          sha256Hex('seeded-token'),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          new Date(),
          invitedUserId,
        ]);

        rep = await cancelInvite(invitedUserId);

        const [result] = await query<DbInvite>(getInviteSql, [invitedUserId]);
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
        expect(rep.body.user_id).toBe(invitedUserId);
      });

      test('Response "status" is "CREATED"', () => {
        expect(rep.body.status).toBe('CREATED');
      });

      test('User status is CREATED in the database', () => {
        expect(dbInvite.status).toBe('CREATED');
      });

      test('Invite token hash is cleared in the database', () => {
        expect(dbInvite.invite_token_hash).toBeNull();
      });

      test('Invite token expiry is cleared in the database', () => {
        expect(dbInvite.invite_token_expiry_at).toBeNull();
      });

      test('Invite email-sent timestamp is cleared in the database', () => {
        expect(dbInvite.invite_email_sent_at).toBeNull();
      });
    });
  });

  describe('POST /internal-users/activate', () => {
    const getResponse = (body: RequestBody) => noAuthAPI.post('/internal-users/activate', body);

    const validPassword = 'TestPass123!@#abc';
    const validTokenLength = 30;

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
        internal.users_authentication
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
          token: faker.string.alphanumeric(30),
          password: 1234,
        } as unknown as RequestBody);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password must be string');
      });

      test('Token shorter than the minimum returns 400', async () => {
        const res = await getResponse({
          token: faker.string.alphanumeric(10),
          password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/token must NOT have fewer than 30 characters');
      });

      test('Token longer than the maximum returns 400', async () => {
        const res = await getResponse({
          token: faker.string.alphanumeric(40),
          password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/token must NOT have more than 30 characters');
      });

      test('Password shorter than the minimum returns 400', async () => {
        const res = await getResponse({
          token: faker.string.alphanumeric(30),
          password: 'short',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password must NOT have fewer than 10 characters');
      });

      test('Password longer than the maximum returns 400', async () => {
        const res = await getResponse({
          token: faker.string.alphanumeric(validTokenLength),
          password: 'a'.repeat(41),
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/password must NOT have more than 40 characters');
      });

      test('Unknown token returns 400', async () => {
        const res = await getResponse({
          token: faker.string.alphanumeric(30),
          password: validPassword,
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid or expired invitation');
      });

      test('Expired token returns 400', async () => {
        const prefix = 'expired-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;
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
        const prefix = 'used-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;
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

      test('Password failing the composition rules returns 400', async () => {
        const prefix = 'weakrule-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;
        await seedInvitedUserWithToken({ rawToken });

        const res = await getResponse({
          token: rawToken,
          // long enough for the schema, but no uppercase and no special character
          password: 'alllowercase123',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Password does not meet the strength requirements');
      });

      test('Rule-satisfying but guessable password returns 400', async () => {
        const prefix = 'weakscore-';
        const rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;
        await seedInvitedUserWithToken({ rawToken });

        const res = await getResponse({
          token: rawToken,
          // passes every composition rule but scores low on zxcvbn (guessability)
          password: 'Password1!',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Password does not meet the strength requirements');
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
        internal.users AS u
        INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
      WHERE
        u.id = $1;`;

      let activatedUserId: string;
      let rawToken: string;
      let rep: Supertest.Response;
      let dbActivated: DbActivated;

      beforeAll(async () => {
        const prefix = 'valid-';
        rawToken = `${prefix}${faker.string.alphanumeric(validTokenLength - prefix.length)}`;

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

  describe('PATCH /internal-users/:user_id/deactivate', () => {
    const getResponse = (userId: string) => authAPISuper.patch(`/internal-users/${userId}/deactivate`);

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
          internal.users AS u
          INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
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
