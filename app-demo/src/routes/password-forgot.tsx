import { createRoute, redirect } from '@tanstack/react-router';

import { resolveSession } from '../features/auth/session.ts';
import PasswordForgotPage from '../pages/PasswordForgotPage.tsx';
import { rootRoute } from './root.tsx';

export const passwordForgotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/password-forgot',
  // An already-authenticated user has no reason to be here; send them to /home. resolveSession skips
  // the /me probe entirely when there's no logged-in hint (the common case for this page).
  beforeLoad: async ({
    context,
  }) => {
    const user = await resolveSession(context.queryClient);

    if (user) throw redirect({ to: '/home' });
  },
  component: PasswordForgotPage,
});
