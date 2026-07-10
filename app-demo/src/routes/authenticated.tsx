import { createRoute, redirect } from '@tanstack/react-router';

import AuthenticatedLayout from '../components/AuthenticatedLayout.tsx';
import { resolveSession } from '../features/auth/session.ts';
import { rootRoute } from './root.tsx';

// Pathless layout route for the authenticated area: it holds the shared session guard and renders the
// app chrome (AppShell) once around an <Outlet>, so navigating between child pages (/home, /roles)
// swaps only the page content instead of remounting the whole shell.
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  // Guard: require a valid session to enter any child page, else send the user to /login.
  // resolveSession skips the /me probe entirely when there's no logged-in hint.
  beforeLoad: async ({
    context,
  }) => {
    const user = await resolveSession(context.queryClient);

    if (!user) throw redirect({ to: '/login' });
  },
  component: AuthenticatedLayout,
});
