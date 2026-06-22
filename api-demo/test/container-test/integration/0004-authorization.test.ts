import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';
import _ from 'lodash';
import { faker } from '@faker-js/faker/locale/en';

import { query } from '../lib/db.ts';
import { authAPISuper, authAPIUser, noAuthAPI } from '../lib/api.ts';
import { getFileNumber, getUserIdByEmail } from '../lib/functions.ts';

import type Supertest from 'supertest';
import type { RequestBody } from '../types/request-types.ts';

const fileNumber = getFileNumber(import.meta.url);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// bob is INTERNAL_USER_READ (INTERNAL_USERS_READ only) — lacks any INTERNAL_PERMISSIONS_* grant.
const READ_ONLY_USER_EMAIL = 'bob.johnson@example.com';
// carol is INTERNAL_USER_ADMIN (user lifecycle perms) — still lacks INTERNAL_PERMISSIONS_WRITE.
const USER_ADMIN_EMAIL = 'carol.williams@example.com';

type PermissionBody = {
  name: string;
  description: string;
};

function randomPermissionBody(): PermissionBody {
  return {
    name: `TEST_PERMISSION_${faker.string.alphanumeric(16).toUpperCase()}`,
    description: faker.lorem.sentence(),
  };
}

interface DbPermission {
  permission_id: string;
  name: string;
  description: string;
}

async function createRandomPermission(): Promise<DbPermission> {
  const {
    name, description,
  } = randomPermissionBody();

  const insertSql = `INSERT INTO internal.permissions
      (name, description)
    VALUES
      ($1, $2)
    RETURNING
      id AS permission_id
      , name
      , description;`;

  const [permission] = await query<DbPermission>(insertSql, [name, description]);

  expect(permission, 'failed to seed test permission').toBeDefined();

  return permission;
}

type RoleBody = {
  name: string;
  description: string;
};

function randomRoleBody(): RoleBody {
  return {
    name: `TEST_ROLE_${faker.string.alphanumeric(16).toUpperCase()}`,
    description: faker.lorem.sentence(),
  };
}

interface DbRole {
  role_id: string;
  name: string;
  description: string;
}

async function createRandomRole(): Promise<DbRole> {
  const {
    name, description,
  } = randomRoleBody();

  const insertSql = `INSERT INTO internal.roles
      (name, description)
    VALUES
      ($1, $2)
    RETURNING
      id AS role_id
      , name
      , description;`;

  const [role] = await query<DbRole>(insertSql, [name, description]);

  expect(role, 'failed to seed test role').toBeDefined();

  return role;
}

describe(`${fileNumber} - Authorization`, () => {
  describe('Authorization guards', () => {
    test('GET /permissions without an access token returns 401', async () => {
      const res = await noAuthAPI.get('/permissions');

      expect(res.statusCode).toBe(401);
    });

    test('POST /permissions without an access token returns 401', async () => {
      const res = await noAuthAPI.post('/permissions', randomPermissionBody());

      expect(res.statusCode).toBe(401);
    });

    test('GET /permissions is forbidden without INTERNAL_PERMISSIONS_READ', async () => {
      const readOnlyAPI = await authAPIUser(READ_ONLY_USER_EMAIL);

      const res = await readOnlyAPI.get('/permissions');

      expect(res.statusCode).toBe(403);
    });

    test('POST /permissions is forbidden without INTERNAL_PERMISSIONS_WRITE', async () => {
      const userAdminAPI = await authAPIUser(USER_ADMIN_EMAIL);

      const res = await userAdminAPI.post('/permissions', randomPermissionBody());

      expect(res.statusCode).toBe(403);
    });

    test('GET /permissions is allowed for the super user (ADMIN)', async () => {
      const res = await authAPISuper.get('/permissions');

      expect(res.statusCode).toBe(200);
    });

    test('GET /roles without an access token returns 401', async () => {
      const res = await noAuthAPI.get('/roles');

      expect(res.statusCode).toBe(401);
    });

    test('POST /roles without an access token returns 401', async () => {
      const res = await noAuthAPI.post('/roles', randomRoleBody());

      expect(res.statusCode).toBe(401);
    });

    test('GET /roles is forbidden without INTERNAL_ROLES_READ', async () => {
      const readOnlyAPI = await authAPIUser(READ_ONLY_USER_EMAIL);

      const res = await readOnlyAPI.get('/roles');

      expect(res.statusCode).toBe(403);
    });

    test('POST /roles is forbidden without INTERNAL_ROLES_WRITE', async () => {
      const userAdminAPI = await authAPIUser(USER_ADMIN_EMAIL);

      const res = await userAdminAPI.post('/roles', randomRoleBody());

      expect(res.statusCode).toBe(403);
    });

    test('GET /roles is allowed for the super user (ADMIN)', async () => {
      const res = await authAPISuper.get('/roles');

      expect(res.statusCode).toBe(200);
    });
  });

  describe('Permissions', () => {
    describe('Permission specificity (via user routes)', () => {
      // The authorize hook is shared across all routes; these cases prove it discriminates
      // on the *specific* permission a route requires. They use the user routes because only
      // ADMIN holds INTERNAL_PERMISSIONS_*, so the permission routes alone cannot show a
      // non-super user being allowed.
      describe('User with the required permission', () => {
        test('PATCH /users/:id/invite is not forbidden with INTERNAL_USERS_AUTHORIZE_WRITE', async () => {
          // carol is INTERNAL_USER_ADMIN — has INTERNAL_USERS_AUTHORIZE_WRITE, so authorization must not block her.
          const targetId = await getUserIdByEmail('bob.johnson@example.com');
          const moderatorAPI = await authAPIUser('carol.williams@example.com');

          const res = await moderatorAPI.patch(`/users/${targetId}/invite`, {
            email: 'invite.test@example.com',
          });

          // Business rules may yield 200/400/409, but authorization must pass.
          expect(res.statusCode).not.toBe(403);
        });
      });

      describe('User without the required permission', () => {
        test('PATCH /users/:id/invite is forbidden without INTERNAL_USERS_AUTHORIZE_WRITE', async () => {
          // bob is INTERNAL_USER_READ — INTERNAL_USERS_READ only, lacks INTERNAL_USERS_AUTHORIZE_WRITE.
          const targetId = await getUserIdByEmail('bob.johnson@example.com');
          const staffAPI = await authAPIUser('bob.johnson@example.com');

          const res = await staffAPI.patch(`/users/${targetId}/invite`, {
            email: 'invite.test@example.com',
          });

          expect(res.statusCode).toBe(403);
        });

        test('DELETE /users/:id is forbidden without INTERNAL_USERS_WRITE', async () => {
          // bob is INTERNAL_USER_READ — INTERNAL_USERS_READ only, lacks INTERNAL_USERS_WRITE.
          const targetId = await getUserIdByEmail('eve.jones@example.com');
          const staffAPI = await authAPIUser('bob.johnson@example.com');

          const res = await staffAPI.del(`/users/${targetId}`);

          expect(res.statusCode).toBe(403);
        });
      });
    });

    describe('GET /permissions - all', () => {
      let seededPermission: DbPermission;

      beforeAll(async () => {
        seededPermission = await createRandomPermission();
      });

      const getResponse = () => authAPISuper.get('/permissions');

      describe('Request Failure', () => {
        test('"page" of "0" returns 400', async () => {
          const res = await authAPISuper.get('/permissions?page=0');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
        });

        test('"page" of non-numeric string returns 400', async () => {
          const res = await authAPISuper.get('/permissions?page=abc');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
        });

        test('"per_page" of "0" returns 400', async () => {
          const res = await authAPISuper.get('/permissions?per_page=0');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
        });

        test('"per_page" of "101" returns 400', async () => {
          const res = await authAPISuper.get('/permissions?per_page=101');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
        });

        test('"permission_id" of non-UUID returns 400', async () => {
          const res = await authAPISuper.get('/permissions?permission_id=not-a-uuid');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/permission_id must match format "uuid"');
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
          const permission = rep.body.output[seededPermission.permission_id];

          expect(permission).toBeDefined();
          expect(permission).toHaveProperty('name');
          expect(permission).toHaveProperty('description');
          expect(permission.name).toBeTypeOf('string');
          expect(permission.description).toBeTypeOf('string');
        });
      });
    });

    describe('GET /permissions - single', () => {
      let permission: DbPermission;

      beforeAll(async () => {
        permission = await createRandomPermission();
      });

      describe('Request Failure', () => {
        test('Non-UUID "permission_id" returns 400', async () => {
          const res = await authAPISuper.get('/permissions?permission_id=12345');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/permission_id must match format "uuid"');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;

        beforeAll(async () => {
          rep = await authAPISuper.get(`/permissions?permission_id=${permission.permission_id}`);
        });

        test('Success response returns 200', () => {
          expect(rep.statusCode).toBe(200);
        });

        test('Response "output" contains only the requested permission', () => {
          expect(rep.body.count).toBe(1);
          expect(Object.keys(rep.body.output)).toEqual([permission.permission_id]);
        });

        test('Returned permission matches the seeded record', () => {
          const result = rep.body.output[permission.permission_id];

          expect(result).toBeDefined();
          expect(result.name).toBe(permission.name);
          expect(result.description).toBe(permission.description);
        });
      });
    });

    describe('POST /permissions', () => {
      const getResponse = (reqBody: RequestBody) => authAPISuper.post('/permissions', reqBody);

      let validRequestBody = {} as RequestBody;

      beforeAll(() => {
        validRequestBody = randomPermissionBody();
      });

      describe('Request Failure', () => {
        test('Absent required body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.name;

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'name'`);
        });

        test('Absent required body "description" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.description;

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'description'`);
        });

        test('Invalid type body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          reqBody.name = 1234;

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/name must be string');
        });

        test('Empty string body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          reqBody.name = '';

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/name must NOT have fewer than 1 characters');
        });

        test('Empty string body "description" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          reqBody.description = '';

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/description must NOT have fewer than 1 characters');
        });

        test('Duplicate "name" returns 400', async () => {
          const existing = await createRandomPermission();

          const res = await getResponse({
            ...validRequestBody,
            name: existing.name,
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Supplied permission name is not unique');
        });

        test('Duplicate "name" differing only by whitespace returns 400', async () => {
          const existing = await createRandomPermission();

          const res = await getResponse({
            ...validRequestBody,
            name: `  ${existing.name}  `,
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Supplied permission name is not unique');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let dbPermission: DbPermission;
        let responseBody: DbPermission;

        beforeAll(async () => {
          rep = await getResponse(validRequestBody);

          const getByIdSql = `SELECT
              p.id AS permission_id
              , p.name
              , p.description
            FROM
              internal.permissions AS p
            WHERE
              p.id = $1;`;
          const [result] = await query<DbPermission>(getByIdSql, [rep.body.permission_id]);

          dbPermission = result;

          ({
            body: responseBody,
          } = rep);
        });

        test('Success response returns 201', () => {
          expect(rep.statusCode).toBe(201);
        });

        test('Response body has correct shape', () => {
          expect(responseBody).toHaveProperty('permission_id');
          expect(responseBody).toHaveProperty('name');
          expect(responseBody).toHaveProperty('description');
        });

        test('Response "permission_id" is a UUID', () => {
          expect(responseBody.permission_id).toMatch(UUID_PATTERN);
        });

        test('Response "name" matches request', () => {
          expect(responseBody.name).toBe(validRequestBody.name);
        });

        test('Response "description" matches request', () => {
          expect(responseBody.description).toBe(validRequestBody.description);
        });

        test('Permission data is persisted in the database', () => {
          expect(dbPermission).toBeDefined();
          expect(dbPermission.name).toBe(validRequestBody.name);
          expect(dbPermission.description).toBe(validRequestBody.description);
        });

        test('"name" with leading and trailing whitespace is stored trimmed', async () => {
          const {
            name, description,
          } = randomPermissionBody();

          const res = await getResponse({
            name: `  ${name}  `,
            description,
          });

          expect(res.statusCode).toBe(201);
          expect(res.body.name).toBe(name);
        });

        test('"description" with leading and trailing whitespace is stored trimmed', async () => {
          const {
            name,
          } = randomPermissionBody();

          const res = await getResponse({
            name,
            description: '  Read everything  ',
          });

          expect(res.statusCode).toBe(201);
          expect(res.body.description).toBe('Read everything');
        });
      });
    });

    describe('PUT /permissions/:permission_id', () => {
      const getResponse = (permissionId: string, reqBody: RequestBody) => authAPISuper.put(`/permissions/${permissionId}`, reqBody);

      let permission: DbPermission;
      let validRequestBody = {} as RequestBody;

      beforeAll(async () => {
        permission = await createRandomPermission();
        validRequestBody = randomPermissionBody();
      });

      describe('Request Failure', () => {
        test('Non-UUID "permission_id" returns 400', async () => {
          const res = await getResponse('not-a-uuid', validRequestBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('params/permission_id must match format "uuid"');
        });

        test('Unknown UUID returns 400', async () => {
          const unknownUuid = '00000000-0000-0000-0000-000000000000';
          const res = await getResponse(unknownUuid, validRequestBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Invalid permission id');
        });

        test('Absent required body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.name;

          const res = await getResponse(permission.permission_id, reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'name'`);
        });

        test('Absent required body "description" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.description;

          const res = await getResponse(permission.permission_id, reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'description'`);
        });

        test('Duplicate "name" of another permission returns 400', async () => {
          const other = await createRandomPermission();

          const res = await getResponse(permission.permission_id, {
            ...validRequestBody,
            name: other.name,
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Supplied permission name is not unique');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let target: DbPermission;
        let updateBody: { name: string;
          description: string; };
        let dbPermission: DbPermission;

        beforeAll(async () => {
          target = await createRandomPermission();
          updateBody = randomPermissionBody();

          rep = await getResponse(target.permission_id, updateBody);

          const getByIdSql = `SELECT
              p.id AS permission_id
              , p.name
              , p.description
            FROM
              internal.permissions AS p
            WHERE
              p.id = $1;`;
          const [result] = await query<DbPermission>(getByIdSql, [target.permission_id]);

          dbPermission = result;
        });

        test('Success response returns 200', () => {
          expect(rep.statusCode).toBe(200);
        });

        test('Response body has correct shape', () => {
          expect(rep.body).toHaveProperty('permission_id');
          expect(rep.body).toHaveProperty('name');
          expect(rep.body).toHaveProperty('description');
        });

        test('Response reflects the updated values', () => {
          expect(rep.body.permission_id).toBe(target.permission_id);
          expect(rep.body.name).toBe(updateBody.name);
          expect(rep.body.description).toBe(updateBody.description);
        });

        test('Updated data is persisted in the database', () => {
          expect(dbPermission.name).toBe(updateBody.name);
          expect(dbPermission.description).toBe(updateBody.description);
        });

        test('Updating a permission to its own existing name succeeds', async () => {
          const existing = await createRandomPermission();

          const res = await getResponse(existing.permission_id, {
            name: existing.name,
            description: 'An updated description',
          });

          expect(res.statusCode).toBe(200);
          expect(res.body.name).toBe(existing.name);
          expect(res.body.description).toBe('An updated description');
        });
      });
    });

    describe('DELETE /permissions/:permission_id', () => {
      const getResponse = (permissionId: string) => authAPISuper.del(`/permissions/${permissionId}`);

      describe('Request Failure', () => {
        test('Non-UUID "permission_id" returns 400', async () => {
          const res = await getResponse('not-a-uuid');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('params/permission_id must match format "uuid"');
        });

        test('Unknown UUID returns 400', async () => {
          const res = await getResponse('00000000-0000-0000-0000-000000000000');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Invalid permission id');
        });

        test('Permission assigned to a role returns 400 and is not deleted', async () => {
          const permission = await createRandomPermission();
          const role = await createRandomRole();
          await query('INSERT INTO internal.roles_permissions (role_id, permission_id) VALUES ($1, $2);', [role.role_id, permission.permission_id]);

          const res = await getResponse(permission.permission_id);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Permission is assigned to one or more roles');

          const getByIdSql = 'SELECT p.id FROM internal.permissions AS p WHERE p.id = $1;';
          const rows = await query<{ id: string }>(getByIdSql, [permission.permission_id]);

          expect(rows).toHaveLength(1);
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let target: DbPermission;

        beforeAll(async () => {
          target = await createRandomPermission();

          rep = await getResponse(target.permission_id);
        });

        test('Success response returns 204', () => {
          expect(rep.statusCode).toBe(204);
        });

        test('Response has no body', () => {
          expect(rep.body).toEqual({});
        });

        test('Permission is removed from the database', async () => {
          const getByIdSql = 'SELECT p.id FROM internal.permissions AS p WHERE p.id = $1;';
          const rows = await query<{ id: string }>(getByIdSql, [target.permission_id]);

          expect(rows).toHaveLength(0);
        });
      });
    });
  });

  describe('Roles', () => {
    describe('GET /roles - all', () => {
      let seededRole: DbRole;

      beforeAll(async () => {
        seededRole = await createRandomRole();
      });

      const getResponse = () => authAPISuper.get('/roles');

      describe('Request Failure', () => {
        test('"page" of "0" returns 400', async () => {
          const res = await authAPISuper.get('/roles?page=0');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
        });

        test('"page" of non-numeric string returns 400', async () => {
          const res = await authAPISuper.get('/roles?page=abc');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
        });

        test('"per_page" of "0" returns 400', async () => {
          const res = await authAPISuper.get('/roles?per_page=0');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
        });

        test('"per_page" of "101" returns 400', async () => {
          const res = await authAPISuper.get('/roles?per_page=101');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
        });

        test('"role_id" of non-UUID returns 400', async () => {
          const res = await authAPISuper.get('/roles?role_id=not-a-uuid');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/role_id must match format "uuid"');
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
          const role = rep.body.output[seededRole.role_id];

          expect(role).toBeDefined();
          expect(role).toHaveProperty('name');
          expect(role).toHaveProperty('description');
          expect(role.name).toBeTypeOf('string');
          expect(role.description).toBeTypeOf('string');
        });
      });
    });

    describe('GET /roles - single', () => {
      let role: DbRole;

      beforeAll(async () => {
        role = await createRandomRole();
      });

      describe('Request Failure', () => {
        test('Non-UUID "role_id" returns 400', async () => {
          const res = await authAPISuper.get('/roles?role_id=12345');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/role_id must match format "uuid"');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;

        beforeAll(async () => {
          rep = await authAPISuper.get(`/roles?role_id=${role.role_id}`);
        });

        test('Success response returns 200', () => {
          expect(rep.statusCode).toBe(200);
        });

        test('Response "output" contains only the requested role', () => {
          expect(rep.body.count).toBe(1);
          expect(Object.keys(rep.body.output)).toEqual([role.role_id]);
        });

        test('Returned role matches the seeded record', () => {
          const result = rep.body.output[role.role_id];

          expect(result).toBeDefined();
          expect(result.name).toBe(role.name);
          expect(result.description).toBe(role.description);
        });
      });
    });

    describe('POST /roles', () => {
      const getResponse = (reqBody: RequestBody) => authAPISuper.post('/roles', reqBody);

      let validRequestBody = {} as RequestBody;

      beforeAll(() => {
        validRequestBody = randomRoleBody();
      });

      describe('Request Failure', () => {
        test('Absent required body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.name;

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'name'`);
        });

        test('Absent required body "description" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.description;

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'description'`);
        });

        test('Invalid type body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          reqBody.name = 1234;

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/name must be string');
        });

        test('Empty string body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          reqBody.name = '';

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/name must NOT have fewer than 1 characters');
        });

        test('Empty string body "description" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          reqBody.description = '';

          const res = await getResponse(reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/description must NOT have fewer than 1 characters');
        });

        test('Duplicate "name" returns 400', async () => {
          const existing = await createRandomRole();

          const res = await getResponse({
            ...validRequestBody,
            name: existing.name,
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Supplied role name is not unique');
        });

        test('Duplicate "name" differing only by whitespace returns 400', async () => {
          const existing = await createRandomRole();

          const res = await getResponse({
            ...validRequestBody,
            name: `  ${existing.name}  `,
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Supplied role name is not unique');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let dbRole: DbRole;
        let responseBody: DbRole;

        beforeAll(async () => {
          rep = await getResponse(validRequestBody);

          const getByIdSql = `SELECT
              r.id AS role_id
              , r.name
              , r.description
            FROM
              internal.roles AS r
            WHERE
              r.id = $1;`;
          const [result] = await query<DbRole>(getByIdSql, [rep.body.role_id]);

          dbRole = result;

          ({
            body: responseBody,
          } = rep);
        });

        test('Success response returns 201', () => {
          expect(rep.statusCode).toBe(201);
        });

        test('Response body has correct shape', () => {
          expect(responseBody).toHaveProperty('role_id');
          expect(responseBody).toHaveProperty('name');
          expect(responseBody).toHaveProperty('description');
        });

        test('Response "role_id" is a UUID', () => {
          expect(responseBody.role_id).toMatch(UUID_PATTERN);
        });

        test('Response "name" matches request', () => {
          expect(responseBody.name).toBe(validRequestBody.name);
        });

        test('Response "description" matches request', () => {
          expect(responseBody.description).toBe(validRequestBody.description);
        });

        test('Role data is persisted in the database', () => {
          expect(dbRole).toBeDefined();
          expect(dbRole.name).toBe(validRequestBody.name);
          expect(dbRole.description).toBe(validRequestBody.description);
        });

        test('"name" with leading and trailing whitespace is stored trimmed', async () => {
          const {
            name, description,
          } = randomRoleBody();

          const res = await getResponse({
            name: `  ${name}  `,
            description,
          });

          expect(res.statusCode).toBe(201);
          expect(res.body.name).toBe(name);
        });

        test('"description" with leading and trailing whitespace is stored trimmed', async () => {
          const {
            name,
          } = randomRoleBody();

          const res = await getResponse({
            name,
            description: '  Full access  ',
          });

          expect(res.statusCode).toBe(201);
          expect(res.body.description).toBe('Full access');
        });
      });
    });

    describe('PUT /roles/:role_id', () => {
      const getResponse = (roleId: string, reqBody: RequestBody) => authAPISuper.put(`/roles/${roleId}`, reqBody);

      let role: DbRole;
      let validRequestBody = {} as RequestBody;

      beforeAll(async () => {
        role = await createRandomRole();
        validRequestBody = randomRoleBody();
      });

      describe('Request Failure', () => {
        test('Non-UUID "role_id" returns 400', async () => {
          const res = await getResponse('not-a-uuid', validRequestBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('params/role_id must match format "uuid"');
        });

        test('Unknown UUID returns 400', async () => {
          const unknownUuid = '00000000-0000-0000-0000-000000000000';
          const res = await getResponse(unknownUuid, validRequestBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Invalid role id');
        });

        test('Absent required body "name" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.name;

          const res = await getResponse(role.role_id, reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'name'`);
        });

        test('Absent required body "description" returns 400', async () => {
          const reqBody = _.cloneDeep(validRequestBody);
          delete reqBody.description;

          const res = await getResponse(role.role_id, reqBody);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'description'`);
        });

        test('Duplicate "name" of another role returns 400', async () => {
          const other = await createRandomRole();

          const res = await getResponse(role.role_id, {
            ...validRequestBody,
            name: other.name,
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Supplied role name is not unique');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let target: DbRole;
        let updateBody: { name: string;
          description: string; };
        let dbRole: DbRole;

        beforeAll(async () => {
          target = await createRandomRole();
          updateBody = randomRoleBody();

          rep = await getResponse(target.role_id, updateBody);

          const getByIdSql = `SELECT
              r.id AS role_id
              , r.name
              , r.description
            FROM
              internal.roles AS r
            WHERE
              r.id = $1;`;
          const [result] = await query<DbRole>(getByIdSql, [target.role_id]);

          dbRole = result;
        });

        test('Success response returns 200', () => {
          expect(rep.statusCode).toBe(200);
        });

        test('Response body has correct shape', () => {
          expect(rep.body).toHaveProperty('role_id');
          expect(rep.body).toHaveProperty('name');
          expect(rep.body).toHaveProperty('description');
        });

        test('Response reflects the updated values', () => {
          expect(rep.body.role_id).toBe(target.role_id);
          expect(rep.body.name).toBe(updateBody.name);
          expect(rep.body.description).toBe(updateBody.description);
        });

        test('Updated data is persisted in the database', () => {
          expect(dbRole.name).toBe(updateBody.name);
          expect(dbRole.description).toBe(updateBody.description);
        });

        test('Updating a role to its own existing name succeeds', async () => {
          const existing = await createRandomRole();

          const res = await getResponse(existing.role_id, {
            name: existing.name,
            description: 'An updated description',
          });

          expect(res.statusCode).toBe(200);
          expect(res.body.name).toBe(existing.name);
          expect(res.body.description).toBe('An updated description');
        });
      });
    });

    describe('DELETE /roles/:role_id', () => {
      const getResponse = (roleId: string) => authAPISuper.del(`/roles/${roleId}`);

      describe('Request Failure', () => {
        test('Non-UUID "role_id" returns 400', async () => {
          const res = await getResponse('not-a-uuid');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('params/role_id must match format "uuid"');
        });

        test('Unknown UUID returns 400', async () => {
          const res = await getResponse('00000000-0000-0000-0000-000000000000');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Invalid role id');
        });

        test('Role assigned to a user returns 400 and is not deleted', async () => {
          const role = await createRandomRole();
          const userId = await getUserIdByEmail(READ_ONLY_USER_EMAIL);
          await query('INSERT INTO internal.users_roles (user_id, role_id) VALUES ($1, $2);', [userId, role.role_id]);

          const res = await getResponse(role.role_id);

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Role is assigned to one or more users');

          const getByIdSql = 'SELECT r.id FROM internal.roles AS r WHERE r.id = $1;';
          const rows = await query<{ id: string }>(getByIdSql, [role.role_id]);

          expect(rows).toHaveLength(1);
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let target: DbRole;

        beforeAll(async () => {
          target = await createRandomRole();

          rep = await getResponse(target.role_id);
        });

        test('Success response returns 204', () => {
          expect(rep.statusCode).toBe(204);
        });

        test('Response has no body', () => {
          expect(rep.body).toEqual({});
        });

        test('Role is removed from the database', async () => {
          const getByIdSql = 'SELECT r.id FROM internal.roles AS r WHERE r.id = $1;';
          const rows = await query<{ id: string }>(getByIdSql, [target.role_id]);

          expect(rows).toHaveLength(0);
        });
      });
    });
  });

  describe('Role Permissions', () => {
    const getResponse = (roleId: string, reqBody: Record<string, unknown>) => authAPISuper.post(`/roles/${roleId}/permissions`, reqBody);

    describe('Authorization guards', () => {
      test('POST /roles/:role_id/permissions without an access token returns 401', async () => {
        const role = await createRandomRole();
        const permission = await createRandomPermission();

        const res = await noAuthAPI.post(`/roles/${role.role_id}/permissions`, {
          permissions: [permission.permission_id],
        });

        expect(res.statusCode).toBe(401);
      });

      test('POST /roles/:role_id/permissions is forbidden without INTERNAL_ROLES_WRITE', async () => {
        const role = await createRandomRole();
        const permission = await createRandomPermission();
        const userAdminAPI = await authAPIUser(USER_ADMIN_EMAIL);

        const res = await userAdminAPI.post(`/roles/${role.role_id}/permissions`, {
          permissions: [permission.permission_id],
        });

        expect(res.statusCode).toBe(403);
      });
    });

    describe('Request Failure', () => {
      let roleId: string;
      let permissionId: string;

      beforeAll(async () => {
        ({
          role_id: roleId,
        } = await createRandomRole());
        ({
          permission_id: permissionId,
        } = await createRandomPermission());
      });

      test('Non-UUID "role_id" returns 400', async () => {
        const res = await getResponse('not-a-uuid', {
          permissions: [permissionId],
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('params/role_id must match format "uuid"');
      });

      test('Unknown role UUID returns 400', async () => {
        const res = await getResponse('00000000-0000-0000-0000-000000000000', {
          permissions: [permissionId],
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid role id');
      });

      test('Absent required body "permissions" returns 400', async () => {
        const res = await getResponse(roleId, {});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe(`body must have required property 'permissions'`);
      });

      test('Empty "permissions" array returns 400', async () => {
        const res = await getResponse(roleId, {
          permissions: [],
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/permissions must NOT have fewer than 1 items');
      });

      test('Non-UUID permission id returns 400', async () => {
        const res = await getResponse(roleId, {
          permissions: ['not-a-uuid'],
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('body/permissions/0 must match format "uuid"');
      });

      test('Unknown permission id returns 400', async () => {
        const res = await getResponse(roleId, {
          permissions: ['00000000-0000-0000-0000-000000000000'],
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('One or more supplied permission ids are invalid');
      });
    });

    describe('Request Success', () => {
      let rep: Supertest.Response;
      let roleId: string;
      let permissionIds: string[];

      beforeAll(async () => {
        ({
          role_id: roleId,
        } = await createRandomRole());

        const firstPermission = await createRandomPermission();
        const secondPermission = await createRandomPermission();
        permissionIds = [firstPermission.permission_id, secondPermission.permission_id];

        rep = await getResponse(roleId, {
          permissions: permissionIds,
        });
      });

      test('Success response returns 201', () => {
        expect(rep.statusCode).toBe(201);
      });

      test('Response body has correct shape', () => {
        expect(rep.body).toHaveProperty('role_id');
        expect(rep.body).toHaveProperty('permissions');
        expect(Array.isArray(rep.body.permissions)).toBe(true);
      });

      test('Response "role_id" matches the target role', () => {
        expect(rep.body.role_id).toBe(roleId);
      });

      test('Response "permissions" contains the assigned permission ids', () => {
        expect([...rep.body.permissions].sort()).toEqual([...permissionIds].sort());
      });

      test('Assignments are persisted in the database', async () => {
        const sql = 'SELECT permission_id FROM internal.roles_permissions WHERE role_id = $1;';
        const rows = await query<{ permission_id: string }>(sql, [roleId]);

        expect(rows.map((row) => row.permission_id).sort()).toEqual([...permissionIds].sort());
      });

      test('Posting to a role that already has permissions returns 400 and assigns nothing new', async () => {
        const newPermission = await createRandomPermission();

        const res = await getResponse(roleId, {
          permissions: [newPermission.permission_id],
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Role permissions already exist');

        // the new permission must not have been assigned
        const sql = 'SELECT permission_id FROM internal.roles_permissions WHERE role_id = $1 AND permission_id = $2;';
        const rows = await query<{ permission_id: string }>(sql, [roleId, newPermission.permission_id]);

        expect(rows).toHaveLength(0);
      });
    });

    describe('GET /roles/permissions', () => {
      describe('Authorization guards', () => {
        test('Request without an access token returns 401', async () => {
          const role = await createRandomRole();

          const res = await noAuthAPI.get(`/roles/permissions?role_id=${role.role_id}`);

          expect(res.statusCode).toBe(401);
        });

        test('Request is forbidden without INTERNAL_ROLES_READ', async () => {
          const role = await createRandomRole();
          const readOnlyAPI = await authAPIUser(READ_ONLY_USER_EMAIL);

          const res = await readOnlyAPI.get(`/roles/permissions?role_id=${role.role_id}`);

          expect(res.statusCode).toBe(403);
        });
      });

      describe('Request Failure', () => {
        test('Non-UUID "role_id" returns 400', async () => {
          const res = await authAPISuper.get('/roles/permissions?role_id=not-a-uuid');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/role_id must match format "uuid"');
        });

        test('"page" of "0" returns 400', async () => {
          const res = await authAPISuper.get('/roles/permissions?page=0');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/page must match pattern "^[1-9][0-9]*$"');
        });

        test('"per_page" of "101" returns 400', async () => {
          const res = await authAPISuper.get('/roles/permissions?per_page=101');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('querystring/per_page must match pattern "^([1-9][0-9]?|100)$"');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let role: DbRole;
        let assignedPermissions: DbPermission[];

        beforeAll(async () => {
          role = await createRandomRole();

          const firstPermission = await createRandomPermission();
          const secondPermission = await createRandomPermission();
          assignedPermissions = [firstPermission, secondPermission];

          const insertSql = 'INSERT INTO internal.roles_permissions (role_id, permission_id) VALUES ($1, $2), ($1, $3);';
          await query(insertSql, [role.role_id, firstPermission.permission_id, secondPermission.permission_id]);

          rep = await authAPISuper.get(`/roles/permissions?role_id=${role.role_id}`);
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
        });

        test('Filtering by "role_id" returns just that role', () => {
          expect(rep.body.count).toBe(1);
          expect(Object.keys(rep.body.output)).toEqual([role.role_id]);
        });

        test('The role entry carries role_id and role_name', () => {
          const entry = rep.body.output[role.role_id];

          expect(entry.role_id).toBe(role.role_id);
          expect(entry.role_name).toBe(role.name);
        });

        test('The role entry nests each assigned permission by id with permission_id and permission_name', () => {
          const {
            permissions,
          } = rep.body.output[role.role_id];

          expect(Object.keys(permissions).sort()).toEqual(assignedPermissions.map((permission) => permission.permission_id).sort());

          assignedPermissions.forEach((permission) => {
            const entry = permissions[permission.permission_id];

            expect(entry).toBeDefined();
            expect(entry.permission_id).toBe(permission.permission_id);
            expect(entry.permission_name).toBe(permission.name);
          });
        });

        test('A role with no assigned permissions returns an empty "permissions" map', async () => {
          const emptyRole = await createRandomRole();

          const res = await authAPISuper.get(`/roles/permissions?role_id=${emptyRole.role_id}`);

          expect(res.statusCode).toBe(200);
          expect(res.body.count).toBe(1);
          expect(res.body.output[emptyRole.role_id].permissions).toEqual({});
        });

        test('Omitting "role_id" returns all roles', async () => {
          const res = await authAPISuper.get('/roles/permissions');

          expect(res.statusCode).toBe(200);
          expect(res.body.output).toBeTypeOf('object');
          expect(res.body.count).toBeGreaterThan(0);
        });
      });
    });

    describe('PUT /roles/:role_id/permissions', () => {
      const getResponse = (roleId: string, reqBody: Record<string, unknown>) => authAPISuper.put(`/roles/${roleId}/permissions`, reqBody);

      describe('Authorization guards', () => {
        test('Request without an access token returns 401', async () => {
          const role = await createRandomRole();
          const permission = await createRandomPermission();

          const res = await noAuthAPI.put(`/roles/${role.role_id}/permissions`, {
            permissions: [permission.permission_id],
          });

          expect(res.statusCode).toBe(401);
        });

        test('Request is forbidden without INTERNAL_ROLES_WRITE', async () => {
          const role = await createRandomRole();
          const permission = await createRandomPermission();
          const userAdminAPI = await authAPIUser(USER_ADMIN_EMAIL);

          const res = await userAdminAPI.put(`/roles/${role.role_id}/permissions`, {
            permissions: [permission.permission_id],
          });

          expect(res.statusCode).toBe(403);
        });
      });

      describe('Request Failure', () => {
        let roleId: string;
        let permissionId: string;

        beforeAll(async () => {
          ({
            role_id: roleId,
          } = await createRandomRole());
          ({
            permission_id: permissionId,
          } = await createRandomPermission());
        });

        test('Non-UUID "role_id" returns 400', async () => {
          const res = await getResponse('not-a-uuid', {
            permissions: [permissionId],
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('params/role_id must match format "uuid"');
        });

        test('Unknown role UUID returns 400', async () => {
          const res = await getResponse('00000000-0000-0000-0000-000000000000', {
            permissions: [permissionId],
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Invalid role id');
        });

        test('Absent required body "permissions" returns 400', async () => {
          const res = await getResponse(roleId, {});

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(`body must have required property 'permissions'`);
        });

        test('Empty "permissions" array returns 400', async () => {
          const res = await getResponse(roleId, {
            permissions: [],
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/permissions must NOT have fewer than 1 items');
        });

        test('Non-UUID permission id returns 400', async () => {
          const res = await getResponse(roleId, {
            permissions: ['not-a-uuid'],
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('body/permissions/0 must match format "uuid"');
        });

        test('Unknown permission id returns 400', async () => {
          const res = await getResponse(roleId, {
            permissions: ['00000000-0000-0000-0000-000000000000'],
          });

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('One or more supplied permission ids are invalid');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let roleId: string;
        let newPermissionIds: string[];

        beforeAll(async () => {
          ({
            role_id: roleId,
          } = await createRandomRole());

          // pre-assign a permission so the replace has to remove it
          const oldPermission = await createRandomPermission();
          await query('INSERT INTO internal.roles_permissions (role_id, permission_id) VALUES ($1, $2);', [roleId, oldPermission.permission_id]);

          const firstPermission = await createRandomPermission();
          const secondPermission = await createRandomPermission();
          newPermissionIds = [firstPermission.permission_id, secondPermission.permission_id];

          rep = await getResponse(roleId, {
            permissions: newPermissionIds,
          });
        });

        test('Success response returns 200', () => {
          expect(rep.statusCode).toBe(200);
        });

        test('Response body has correct shape', () => {
          expect(rep.body).toHaveProperty('role_id');
          expect(rep.body).toHaveProperty('permissions');
          expect(Array.isArray(rep.body.permissions)).toBe(true);
        });

        test('Response reflects the new permission set', () => {
          expect(rep.body.role_id).toBe(roleId);
          expect([...rep.body.permissions].sort()).toEqual([...newPermissionIds].sort());
        });

        test('The role permissions are replaced in the database (old removed, new present)', async () => {
          const rows = await query<{ permission_id: string }>('SELECT permission_id FROM internal.roles_permissions WHERE role_id = $1;', [roleId]);

          expect(rows.map((row) => row.permission_id).sort()).toEqual([...newPermissionIds].sort());
        });

        test('Re-sending the same set is idempotent', async () => {
          const res = await getResponse(roleId, {
            permissions: newPermissionIds,
          });

          expect(res.statusCode).toBe(200);
          expect([...res.body.permissions].sort()).toEqual([...newPermissionIds].sort());
        });
      });
    });

    describe('DELETE /roles/:role_id/permissions', () => {
      const getResponse = (roleId: string) => authAPISuper.del(`/roles/${roleId}/permissions`);

      describe('Authorization guards', () => {
        test('Request without an access token returns 401', async () => {
          const role = await createRandomRole();

          const res = await noAuthAPI.del(`/roles/${role.role_id}/permissions`);

          expect(res.statusCode).toBe(401);
        });

        test('Request is forbidden without INTERNAL_ROLES_WRITE', async () => {
          const role = await createRandomRole();
          const userAdminAPI = await authAPIUser(USER_ADMIN_EMAIL);

          const res = await userAdminAPI.del(`/roles/${role.role_id}/permissions`);

          expect(res.statusCode).toBe(403);
        });
      });

      describe('Request Failure', () => {
        test('Non-UUID "role_id" returns 400', async () => {
          const res = await getResponse('not-a-uuid');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('params/role_id must match format "uuid"');
        });

        test('Unknown role UUID returns 400', async () => {
          const res = await getResponse('00000000-0000-0000-0000-000000000000');

          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe('Invalid role id');
        });
      });

      describe('Request Success', () => {
        let rep: Supertest.Response;
        let roleId: string;

        beforeAll(async () => {
          ({
            role_id: roleId,
          } = await createRandomRole());

          const firstPermission = await createRandomPermission();
          const secondPermission = await createRandomPermission();

          const insertSql = 'INSERT INTO internal.roles_permissions (role_id, permission_id) VALUES ($1, $2), ($1, $3);';
          await query(insertSql, [roleId, firstPermission.permission_id, secondPermission.permission_id]);

          rep = await getResponse(roleId);
        });

        test('Success response returns 204', () => {
          expect(rep.statusCode).toBe(204);
        });

        test('Response has no body', () => {
          expect(rep.body).toEqual({});
        });

        test('All of the role\'s permissions are removed from the database', async () => {
          const sql = 'SELECT permission_id FROM internal.roles_permissions WHERE role_id = $1;';
          const rows = await query<{ permission_id: string }>(sql, [roleId]);

          expect(rows).toHaveLength(0);
        });

        test('Clearing a role that has no permissions still returns 204', async () => {
          const res = await getResponse(roleId);

          expect(res.statusCode).toBe(204);
        });
      });
    });
  });
});
