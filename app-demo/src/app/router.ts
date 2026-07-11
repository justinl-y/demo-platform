import { createRoute, createRouter, redirect } from '@tanstack/react-router';

import { resolveSession } from '../features/auth/session.ts';
import { authenticatedRoute } from '../routes/authenticated.tsx';
import { homeRoute } from '../routes/home.tsx';
import { loginRoute } from '../routes/login.tsx';
import { passwordForgotRoute } from '../routes/password-forgot.tsx';
import { passwordResetRoute } from '../routes/password-reset.tsx';
import { rolesRoute } from '../routes/roles.tsx';
import { rootRoute } from '../routes/root.tsx';
import { queryClient } from './query-client.ts';

// `/` has no page of its own. Resolve the session here and redirect straight to the final
// destination, so an unauthenticated start goes / -> /login with no visible /home bounce (and no
// /me probe at all when there's no prior session).
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async ({
    context,
  }) => {
    const user = await resolveSession(context.queryClient);

    throw redirect({ to: user ? '/home' : '/login' });
  },
});

// Exported so tests can build an isolated router (fresh memory history) over the same route tree.
export const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  passwordForgotRoute,
  passwordResetRoute,
  authenticatedRoute.addChildren([
    homeRoute,
    rolesRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
});
