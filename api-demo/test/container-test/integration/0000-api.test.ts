import {
  beforeAll,
  describe,
  expect,
  test,
} from 'vitest';

import { noAuthAPI } from '../lib/api.ts';
import { getFileNumber } from '../lib/functions.ts';

import type Supertest from 'supertest';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - API`, async () => {
  describe('GET /health_db', async () => {
    const getResponse = () => noAuthAPI.get('/health_db');

    describe('Request Success', () => {
      let res: Supertest.Response;
      let responseData: Supertest.Response['body'];

      beforeAll(async () => {
        res = await getResponse();
        ({ body: responseData } = res);
      });

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
