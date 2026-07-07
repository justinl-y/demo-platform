import { createRoute, redirect } from '@tanstack/react-router';

import { resolveSession } from '../features/auth/session.ts';
import HomePage from '../pages/HomePage.tsx';
import { rootRoute } from './root.tsx';

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  // Guard: require a valid session to enter, else send the user to /login. resolveSession skips the
  // /me probe entirely when there's no logged-in hint.
  beforeLoad: async ({
    context,
  }) => {
    const user = await resolveSession(context.queryClient);

    if (!user) throw redirect({ to: '/login' });
  },
  component: HomePage,
});
