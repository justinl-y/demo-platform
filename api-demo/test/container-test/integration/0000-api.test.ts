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

describe(`${fileNumber} - API`, () => {
  describe('GET /health_db', () => {
    const getResponse = () => noAuthAPI.get('/health_db');

    describe('Request Success', () => {
      let rep: Supertest.Response;
      let responseData: Supertest.Response['body'];

      beforeAll(async () => {
        rep = await getResponse();
        ({ body: responseData } = rep);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response schema matches the expected structure', () => {
        expect(responseData).toBeTypeOf('object');
        expect(responseData).toHaveProperty('status');
        expect(responseData).toHaveProperty('timestamp');
      });
    });
  });
  describe('GET /health_eb', () => {
    const getResponse = () => noAuthAPI.get('/health_eb');

    describe('Request Success', () => {
      let rep: Supertest.Response;
      let responseData: Supertest.Response['body'];

      beforeAll(async () => {
        rep = await getResponse();
        ({ body: responseData } = rep);
      });

      test('Success response returns 200', () => {
        expect(rep.statusCode).toBe(200);
      });

      test('Response schema matches the expected structure', () => {
        expect(responseData).toBeTypeOf('object');
        expect(responseData).toHaveProperty('status');
        expect(responseData).toHaveProperty('timestamp');
      });
    });
  });
});
