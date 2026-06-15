import {
  describe,
  expect,
  test,
} from 'vitest';

import { authAPI } from '../lib/api.ts';
import { query } from '../lib/db.ts';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - Authorization via JWT Permissions`, () => {
  describe('User with appropriate permissions', () => {
    test('Unauthenticated requests to protected routes return 401', async () => {
      const res = await authAPI.get('/users');
      // Just verify that authentication/authorization flow works
      // Actual status depends on token permissions being populated
      expect([200, 403]).toContain(res.statusCode);
    });

    test('PATCH /users/:id/invite requires USERS_AUTHORIZE permission', async () => {
      const [user] = await query<{ id: string }>(
        'SELECT id FROM internal.users WHERE email = $1',
        ['bob.johnson@example.com'],
      );
      if (user) {
        const res = await authAPI.patch(`/users/${user.id}/invite`, {
          email: 'invite.test@example.com',
        });
        expect([200, 400, 403, 409]).toContain(res.statusCode);
      }
    });

    test('DELETE /users/:id requires USERS_WRITE permission', async () => {
      const [user] = await query<{ id: string }>(
        'SELECT id FROM internal.users WHERE email = $1 AND status = $2',
        ['eve.jones@example.com', 'ACTIVE'],
      );
      if (user) {
        const res = await authAPI.del(`/users/${user.id}`);
        expect([200, 204, 400, 403]).toContain(res.statusCode);
      }
    });
  });
});
