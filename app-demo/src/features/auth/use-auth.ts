import { useQuery } from '@tanstack/react-query';

import { meQueryOptions } from './queries.ts';

// Reads auth state from the shared `me` query cache. On a guarded route the query is already
// populated by the route's beforeLoad, so `user` is available without an extra fetch.
export const useAuth = () => {
  const {
    data, isLoading,
  } = useQuery(meQueryOptions);

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading,
  };
};
