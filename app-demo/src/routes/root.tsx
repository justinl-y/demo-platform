import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

import type { QueryClient } from '@tanstack/react-query';

// The queryClient is injected into every route's context so guards (beforeLoad) can resolve the
// `me` query without importing the client directly.
export interface RouterContext {
  queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
});
