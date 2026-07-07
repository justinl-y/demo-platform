import { createRoute, redirect } from '@tanstack/react-router';

import { resolveSession } from '../features/auth/session.ts';
import LoginPage from '../pages/LoginPage.tsx';
import { rootRoute } from './root.tsx';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  // If already authenticated, skip the form and go straight to /home; otherwise stay. resolveSession
  // skips the /me probe entirely when there's no logged-in hint.
  beforeLoad: async ({
    context,
  }) => {
    const user = await resolveSession(context.queryClient);

    if (user) throw redirect({ to: '/home' });
  },
  component: LoginPage,
});
