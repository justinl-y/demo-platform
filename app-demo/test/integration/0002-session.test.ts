import { describe, expect, test } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';

import { API_BASE_URL } from '../../src/lib/env.ts';
import { mockUser } from '../mocks/handlers.ts';
import { server } from '../mocks/server.ts';
import { meQueryOptions } from '../../src/features/auth/queries.ts';
import { resolveSession, setAuthHint } from '../../src/features/auth/session.ts';

const HINT_KEY = 'demo.authed';

describe('Resolve Session', () => {
  describe('Failure', () => {
    test('a real 401 clears the session and returns null', async () => {
      // Both /me and the api-client's follow-up /refresh reject → the session is genuinely over.
      server.use(
        http.get(`${API_BASE_URL}/me`, () => HttpResponse.json({ message: 'no' }, { status: 401 })),
        http.post(`${API_BASE_URL}/refresh`, () => HttpResponse.json({ message: 'no' }, { status: 401 })),
      );

      const queryClient = new QueryClient();
      setAuthHint();

      const user = await resolveSession(queryClient);

      expect(user).toBeNull();
      expect(localStorage.getItem(HINT_KEY)).toBeNull(); // hint cleared → guard redirects to /login
    });

    test('returns null without a network call when there is no hint', async () => {
      const queryClient = new QueryClient();

      // No hint set, and MSW is configured to error on any unhandled request, so a stray /me call
      // would fail the test — proving the probe was skipped entirely.
      const user = await resolveSession(queryClient);

      expect(user).toBeNull();
    });
  });

  describe('Success', () => {
    test('a transient /me failure keeps the cached session instead of logging out', async () => {
      // /me is down (5xx), not a real 401 — the still-valid session must survive.
      server.use(
        http.get(`${API_BASE_URL}/me`, () => HttpResponse.json({ message: 'boom' }, { status: 500 })),
      );

      const queryClient = new QueryClient();
      setAuthHint();
      // Seed the cached user, then invalidate so the guard actually re-checks /me (and hits the 500)
      // rather than trusting the fresh cache.
      queryClient.setQueryData(meQueryOptions.queryKey, mockUser);
      await queryClient.invalidateQueries({ queryKey: meQueryOptions.queryKey });

      const user = await resolveSession(queryClient);

      expect(user).toEqual(mockUser);
      expect(localStorage.getItem(HINT_KEY)).toBe('1'); // hint preserved → guard stays on /home
    });
  });
});
