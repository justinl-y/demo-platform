import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateRole } from './api.ts';

import type { RoleInput } from '#shared/types';

// Updates a role and refreshes the list. Invalidating the `['roles', 'list']` prefix covers every
// cached search term, so the table re-fetches the current view with the edited values.
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      body,
    }: {
      roleId: string;
      body: RoleInput;
    }) => updateRole(roleId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles', 'list'] }),
  });
};
