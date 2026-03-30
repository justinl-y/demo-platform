import {
  describe,
  expect,
  test,
} from 'vitest';
import request from 'supertest';

import { BASE_REQUEST } from '../lib/constants.ts';

describe('0002 API docs routes', () => {
  test('GET /api-docs returns Swagger UI HTML', async () => {
    const res = await request(BASE_REQUEST)
      .get('/api-docs')
      .set('Accept', 'text/html');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/i);
    expect(res.text).toContain('Swagger UI');
  });

  test('GET /api-docs/json returns OpenAPI specification', async () => {
    const res = await request(BASE_REQUEST)
      .get('/api-docs/json')
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/i);
    expect(res.body).toBeTypeOf('object');
    expect(res.body).toHaveProperty('openapi');
    expect(res.body).toHaveProperty('info.title');
  });
});
