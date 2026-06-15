import {
  describe,
  expect,
  test,
} from 'vitest';

import { authAPI, authAPIAs, noAuthAPI } from '../lib/api.ts';
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
      const res = await authAPI.get('/users');

      expect(res.statusCode).toBe(200);
    });

    test('PATCH /users/:id/invite is not forbidden with USERS_AUTHORIZE', async () => {
      // carol is MODERATOR — has USERS_AUTHORIZE, so authorization must not block her.
      const targetId = await getUserIdByEmail('bob.johnson@example.com');
      const moderatorAPI = await authAPIAs('carol.williams@example.com');

      const reqBody = {
        email: 'invite.test@example.com',
      };

      const res = await moderatorAPI.patch(`/users/${targetId}/invite`, reqBody);

      // Business rules may yield 200/400/409, but authorization must pass.
      expect(res.statusCode).not.toBe(403);
    });
  });

  describe('User without the required permission', () => {
    test('PATCH /users/:id/invite is forbidden without USERS_AUTHORIZE', async () => {
      // bob is STAFF — USERS_READ only, lacks USERS_AUTHORIZE.
      const targetId = await getUserIdByEmail('bob.johnson@example.com');
      const staffAPI = await authAPIAs('bob.johnson@example.com');

      const reqBody = {
        email: 'invite.test@example.com',
      };

      const res = await staffAPI.patch(`/users/${targetId}/invite`, reqBody);

      expect(res.statusCode).toBe(403);
    });

    test('DELETE /users/:id is forbidden without USERS_WRITE', async () => {
      // bob is STAFF — USERS_READ only, lacks USERS_WRITE.
      const targetId = await getUserIdByEmail('eve.jones@example.com');
      const staffAPI = await authAPIAs('bob.johnson@example.com');

      const res = await staffAPI.del(`/users/${targetId}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
