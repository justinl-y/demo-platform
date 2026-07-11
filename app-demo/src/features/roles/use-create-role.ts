import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createRole } from './api.ts';

// Creates a role and refreshes the list. Invalidating the `['roles', 'list']` prefix covers every
// cached search term, so the table re-fetches the current view including the new role.
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', 'list'] }),
  });
};
