import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { login } from './api.ts';
import { meQueryOptions } from './queries.ts';
import { setAuthHint } from './session.ts';

// Logs in, seeds the `me` cache with the returned user (so /home renders without a follow-up
// fetch), records the logged-in hint (so later loads skip straight to hydrating), and navigates
// to /home.
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      setAuthHint();
      queryClient.setQueryData(meQueryOptions.queryKey, user);
      void navigate({ to: '/home' });
    },
  });
};
