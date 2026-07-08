import { describe, expect, test } from 'vitest';

import { handlers } from '../mocks/handlers.ts';

describe('Mock API handlers', () => {
  test('auto-generates a baseline covering endpoints beyond the typed overrides', () => {
    // 2 typed overrides (/login, /me) + one auto-generated handler per spec operation. If
    // fromOpenApi produced nothing (e.g. a spec parsing issue), this would be just the 2 overrides.
    expect(handlers.length).toBeGreaterThan(2);
  });
});
