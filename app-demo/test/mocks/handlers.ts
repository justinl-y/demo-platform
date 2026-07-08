import { fromOpenApi } from '@mswjs/source/open-api';
import { createOpenApiHttp } from 'openapi-msw';

import { API_BASE_URL } from '../../src/lib/env.ts';
import spec from '#shared/openapi.json';

import type { paths } from './openapi.ts';

// openapi-msw for the typed overrides — response bodies are compile-checked against the spec, so a
// contract change breaks the handler at typecheck (the drift guard).
export const http = createOpenApiHttp<paths>({ baseUrl: API_BASE_URL });

// Default authenticated user — an admin holding every permission the API enforces. The permission
// list is derived from the spec's `x-permissions` (collected from the route configs at generation
// time), so it stays current as routes grow rather than being hardcoded here; it degrades to [] if a
// regenerated/edited spec ever lacks the extension, rather than throwing at module load. The user's
// shape is validated against the /login + /me 200 response schema, so a rename like id -> user_id
// would fail here the moment the spec is regenerated.
export const mockUser = {
  user_id: '00000000-0000-0000-0000-000000000001',
  email: 'user@example.com',
  full_name: 'Test User',
  known_as: 'Test',
  permissions: [...((spec as { 'x-permissions'?: string[] })['x-permissions'] ?? [])],
};

// Typed overrides for the endpoints tests assert specific data on. Listed first so they win over
// the auto-generated baseline (MSW responds with the first matching handler).
const overrides = [
  http.post('/login', ({
    response,
  }) => response(200).json(mockUser)),
  http.get('/me', ({
    response,
  }) => response(200).json(mockUser)),
];

// Auto-generated baseline covering every endpoint in the spec, with responses drawn from the route
// schemas' `example` values — so any call the app makes returns a schema-valid response without a
// hand-written handler. `servers` is injected so the generated handlers match the app's absolute API
// origin (the committed spec carries no server URL). Individual tests still override via server.use().
const baseline = await fromOpenApi({
  ...spec,
  servers: [{ url: API_BASE_URL }],
} as unknown as Parameters<typeof fromOpenApi>[0]);

export const handlers = [...overrides, ...baseline];
