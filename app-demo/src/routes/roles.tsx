import { createRoute } from '@tanstack/react-router';

import RolesPage from '../pages/RolesPage.tsx';
import { authenticatedRoute } from './authenticated.tsx';

// Child of the authenticated layout route: the session guard and AppShell chrome live on the parent.
export const rolesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/roles',
  component: RolesPage,
});
