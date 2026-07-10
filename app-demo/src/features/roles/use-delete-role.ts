import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteRole } from './api.ts';

// Deletes a role and refreshes the list. Invalidating the `['roles', 'list']` prefix covers every
// cached search term, so the table re-fetches the current view once the row is gone.
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', 'list'] }),
  });
};
