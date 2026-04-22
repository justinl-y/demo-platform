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

describe(`${fileNumber} - API Docs`, () => {
  describe('GET /api-docs', () => {
    const getResponse = () => noAuthAPI.get('/api-docs');

    describe('Request Success', () => {
      let rep: Supertest.Response;

      beforeAll(async () => {
        rep = await getResponse();
      });

      test('returns 200 with Swagger UI HTML', () => {
        expect(rep.statusCode).toBe(200);
        expect(rep.headers['content-type']).toMatch(/text\/html/i);
        expect(rep.text).toContain('Swagger UI');
      });
    });
  });

  describe('GET /api-docs/json', () => {
    const getResponse = () => noAuthAPI.get('/api-docs/json');

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

      test('Response returns OpenAPI specification', () => {
        expect(rep.headers['content-type']).toMatch(/application\/json/i);
        expect(responseData).toBeTypeOf('object');
        expect(responseData).toHaveProperty('openapi');
        expect(responseData).toHaveProperty('info.title');
      });
    });
  });
});
