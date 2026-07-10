import { httpErrorStatus } from '../../lib/api-client.ts';
import { clearSentryUser, setSentryUser } from '../../lib/sentry.ts';
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
const hasAuthHint = (): boolean => localStorage.getItem(HINT_KEY) === '1';

// Clears client-side auth state: the readable login hint and the Sentry user. (A full logout also
// drops the query cache — see useLogout.)
export const clearAuthState = (): void => {
  localStorage.removeItem(HINT_KEY);
  clearSentryUser();
};

// Resolves the current user for route guards. Returns null with no network call when the hint says
// there's no session; otherwise validates/hydrates via /me (the api-client transparently attempts a
// /refresh on a 401) and clears the hint if it turned out to be stale.
export const resolveSession = async (queryClient: QueryClient): Promise<InternalUser | null> => {
  if (!hasAuthHint()) return null;

  try {
    // fetchQuery (not ensureQueryData) re-checks /me once the cache is older than staleTime, so a
    // session revoked server-side is caught on the next guarded navigation instead of trusted from
    // cache. Fresh cache (e.g. right after login) is still returned without a network call.
    const user = await queryClient.fetchQuery(meQueryOptions);
    setSentryUser(user);

    return user;
  }
  catch (error) {
    // Only a real 401 (the api-client already tried /refresh) means the session is over — tear it
    // down. A transient failure (network blip, 5xx) shouldn't log a still-valid session out, so fall
    // back to any cached user and let the guard proceed rather than clearing the hint.
    const status = httpErrorStatus(error);
    if (status !== 401) {
      return queryClient.getQueryData<InternalUser>(meQueryOptions.queryKey) ?? null;
    }

    clearAuthState();

    return null;
  }
};
