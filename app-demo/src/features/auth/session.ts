import { meQueryOptions } from './queries.ts';

import type { QueryClient } from '@tanstack/react-query';
import type { InternalUser } from '#shared/types';

// A readable "logged-in" hint. The auth cookies are HttpOnly (JS can't inspect them), so without
// this the app must probe /me on every load just to discover it's logged out — producing console
// 401s on a cold, logged-out start. The hint lets guards skip that probe entirely when there's no
// prior session. It is a best-effort optimization, never the source of truth: the server still
// decides from the cookies, and a stale hint is self-correcting (see resolveSession).
const HINT_KEY = 'demo.authed';

export const setAuthHint = (): void => localStorage.setItem(HINT_KEY, '1');
export const clearAuthHint = (): void => localStorage.removeItem(HINT_KEY);
const hasAuthHint = (): boolean => localStorage.getItem(HINT_KEY) === '1';

// Resolves the current user for route guards. Returns null with no network call when the hint says
// there's no session; otherwise validates/hydrates via /me (the api-client transparently attempts a
// /refresh on a 401) and clears the hint if it turned out to be stale.
export const resolveSession = async (queryClient: QueryClient): Promise<InternalUser | null> => {
  if (!hasAuthHint()) return null;

  try {
    return await queryClient.ensureQueryData(meQueryOptions);
  }
  catch {
    clearAuthHint();

    return null;
  }
};
