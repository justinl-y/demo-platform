import { createRoute, redirect } from '@tanstack/react-router';

import { isResetTokenValid } from '../features/auth/api.ts';
import { resolveSession } from '../features/auth/session.ts';
import PasswordResetPage from '../pages/PasswordResetPage.tsx';
import { rootRoute } from './root.tsx';

export interface PasswordResetSearch {
  token?: string;
}

// Fixed length of the emailed reset token, mirroring the API's password_reset_token schema
// (min/maxLength 30 on POST /password/reset[/validate]). The API is the source of truth; this
// lets a wrong-length token render the invalid-link state instead of 400ing on validate and
// getting bounced to /login as if it were a used/expired link.
const RESET_TOKEN_LENGTH = 30;

export const passwordResetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset',
  // The reset token rides in as ?token= on the emailed link. Coerce to a trimmed string (or drop it)
  // so the page gets a clean, typed value; a missing/blank or malformed-length token is dropped and
  // renders the invalid-link state.
  validateSearch: (search: Record<string, unknown>): PasswordResetSearch => {
    const token = typeof search.token === 'string' ? search.token.trim() : '';

    // Return token: undefined (not {}) to drop it — the router merges this onto the raw URL search,
    // so an explicit undefined is what strips a missing/blank/wrong-length token from the match.
    return token.length === RESET_TOKEN_LENGTH ? { token } : { token: undefined };
  },
  beforeLoad: async ({
    context,
    search,
  }) => {
    // Already-authenticated users don't reset via the emailed link; send them to /home.
    const user = await resolveSession(context.queryClient);

    if (user) throw redirect({ to: '/home' });

    // A used or expired link can never succeed — check the token server-side (without consuming it)
    // and send those straight to /login instead of rendering a form that would only 400 on submit.
    // A missing token falls through to the page's invalid-link state.
    if (search.token && !(await isResetTokenValid(search.token))) {
      throw redirect({ to: '/login' });
    }
  },
  component: PasswordResetPage,
});
