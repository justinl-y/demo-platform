import { createRoute, redirect } from '@tanstack/react-router';

import { isResetTokenValid } from '../features/auth/api.ts';
import { resolveSession } from '../features/auth/session.ts';
import PasswordResetPage from '../pages/PasswordResetPage.tsx';
import { rootRoute } from './root.tsx';

export interface PasswordResetSearch {
  token?: string;
}

export const passwordResetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-reset',
  // The reset token rides in as ?token= on the emailed link. Coerce to a trimmed string (or drop it)
  // so the page gets a clean, typed value; a missing/blank token renders the invalid-link state.
  validateSearch: (search: Record<string, unknown>): PasswordResetSearch => {
    const token = typeof search.token === 'string' ? search.token.trim() : '';

    return token ? { token } : {};
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
