import {
  expect,
  test,
} from 'vitest';

import { query } from '../lib/db.ts';

test('DB test', async () => {
  const sql = `INSERT INTO public.users
    (
      customer_old_id,
      customer_id,
      locale,
      email,
      permissions,
      authentication_details,
      "password",
      first_name,
      last_name,
      company,
      "position",
      country,
      state,
      city,
      main_phone,
      password_reset_key,
      auth_id_migrated,
      is_active
    )
    VALUES(
      '1815617205937637031',
      2705495386310575111,
      '{"tempConv": "f"}'::jsonb,
      'flibble@semios.com',
      '{"level": 10}'::jsonb,
      '{}'::jsonb,
      '$2b$10$sAAgh3ITaRT6mBxDMPm09OTjCIXPHGrdr1.Cg6nppMzSEd6wsxwCG',
      'Mr',
      'Flibble',
      'Semios',
      'Hand puppet',
      'Canada',
      'British Columbia',
      'Vancouver',
      '+15551234567',
      '834667e85ce362f28fac0f0f2f5803f051ccf6fb',
      true,
      true
    );
  `;

  await query(sql);

  const result = await query('SELECT * FROM public.users WHERE email=$1', ['flibble@semios.com']);

  expect(result).toBeTypeOf('object');
});
