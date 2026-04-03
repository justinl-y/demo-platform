import {
  describe,
  expect,
  test,
} from 'vitest';
import request from 'supertest';

import { BASE_REQUEST } from '../lib/constants.ts';
import { getFileNumber } from '../lib/functions.ts';

const fileNumber = getFileNumber(import.meta.url);

describe(`${fileNumber} - API Docs`, () => {
  test('GET /api-docs returns Swagger UI HTML', async () => {
    const rep = await request(BASE_REQUEST)
      .get('/api-docs')
      .set('Accept', 'text/html');

    expect(rep.statusCode).toBe(200);
    expect(rep.headers['content-type']).toMatch(/text\/html/i);
    expect(rep.text).toContain('Swagger UI');
  });

  test('GET /api-docs/json returns OpenAPI specification', async () => {
    const rep = await request(BASE_REQUEST)
      .get('/api-docs/json')
      .set('Accept', 'application/json');

    expect(rep.statusCode).toBe(200);
    expect(rep.headers['content-type']).toMatch(/application\/json/i);
    expect(rep.body).toBeTypeOf('object');
    expect(rep.body).toHaveProperty('openapi');
    expect(rep.body).toHaveProperty('info.title');
  });
});
