import { Outlet } from '@tanstack/react-router';

import AppShell from './AppShell.tsx';

// Rendered by the authenticated layout route: the app chrome (AppShell) wraps an <Outlet> so it
// mounts once and only the child page swaps on navigation.
export default function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
