import { queryOptions } from '@tanstack/react-query';

import { fetchMe } from './api.ts';

// The current-user query is the app's single source of auth state. `retry: false` keeps a real
// 401 (session over) from being retried; the api-client already handles the /refresh attempt.
export const meQueryOptions = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: fetchMe,
  retry: false,
  staleTime: 5 * 60 * 1000,
});
