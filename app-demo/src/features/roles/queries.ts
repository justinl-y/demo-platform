import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { fetchRoles } from './api.ts';

import type { RolesQuery } from './api.ts';

// One list query per (page, perPage, search, order) tuple, cached independently. keepPreviousData
// keeps the current page visible while the next page/sort/search loads instead of flashing empty.
// Mutations invalidate the `['roles', 'list']` prefix, which covers every tuple.
export const rolesQueryOptions = (params: RolesQuery) => queryOptions({
  queryKey: ['roles', 'list', params],
  queryFn: () => fetchRoles(params),
  staleTime: 60 * 1000,
  placeholderData: keepPreviousData,
});
