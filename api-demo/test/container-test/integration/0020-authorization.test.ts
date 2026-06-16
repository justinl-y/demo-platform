import {
  describe,
  expect,
  test,
} from 'vitest';

import { authAPISuper, authAPIUser, noAuthAPI } from '../lib/api.ts';
import { query } from '../lib/db.ts';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(import.meta.url);

async function getUserIdByEmail(email: string): Promise<string> {
  const getUserSql = 'SELECT u.id FROM internal.users AS u WHERE u.email = $1';
  const sqlParams = [email];

  const [user] = await query<{ id: string }>(getUserSql, sqlParams);

  expect(user, `seed user not found: ${email}`).toBeDefined();

  return user.id;
}

describe(`${fileNumber} - Authorization via JWT Permissions`, () => {
  describe('Unauthenticated requests', () => {
    test('Requests to protected routes without an access token return 401', async () => {
      const res = await noAuthAPI.get('/users');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('User with the required permission', () => {
    test('GET /users is allowed for the super user', async () => {
      const res = await authAPISuper.get('/users');

      expect(res.statusCode).toBe(200);
    });

    test('PATCH /users/:id/invite is not forbidden with INTERNAL_USERS_AUTHORIZE_WRITE', async () => {
      // carol is INTERNAL_USER_ADMIN — has INTERNAL_USERS_AUTHORIZE_WRITE, so authorization must not block her.
      const targetId = await getUserIdByEmail('bob.johnson@example.com');
      const moderatorAPI = await authAPIUser('carol.williams@example.com');

      const reqBody = {
        email: 'invite.test@example.com',
      };

      const res = await moderatorAPI.patch(`/users/${targetId}/invite`, reqBody);

      // Business rules may yield 200/400/409, but authorization must pass.
      expect(res.statusCode).not.toBe(403);
    });
  });

  describe('User without the required permission', () => {
    test('PATCH /users/:id/invite is forbidden without INTERNAL_USERS_AUTHORIZE_WRITE', async () => {
      // bob is INTERNAL_USER_READ — INTERNAL_USERS_READ only, lacks INTERNAL_USERS_AUTHORIZE_WRITE.
      const targetId = await getUserIdByEmail('bob.johnson@example.com');
      const staffAPI = await authAPIUser('bob.johnson@example.com');

      const reqBody = {
        email: 'invite.test@example.com',
      };

      const res = await staffAPI.patch(`/users/${targetId}/invite`, reqBody);

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
