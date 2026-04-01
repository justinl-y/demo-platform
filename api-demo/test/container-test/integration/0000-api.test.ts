import path from 'path';
import {
  describe,
  expect,
  test,
} from 'vitest';

import { noAuthAPI } from '../lib/api.ts';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(path.basename(__filename));

describe(`${fileNumber} DB test`, async () => {
  describe('GET /health_db', async () => {
    const getResponse = () => noAuthAPI.get('/health_db');

    describe('Request Success', async () => {
      const res = await getResponse();
      const { body: responseData } = res;

      test('Success response returns 200', () => {
        expect(res.statusCode).toBe(200);
      });

      test('Response schema matches the expected structure', () => {
        expect(responseData).toBeTypeOf('object');
        expect(responseData).toHaveProperty('status');
        expect(responseData).toHaveProperty('timestamp');
      });
    });
  });
});
