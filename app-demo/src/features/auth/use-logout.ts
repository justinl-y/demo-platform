import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { logout } from './api.ts';
import { clearAuthState } from './session.ts';

// Clears the auth cookies server-side, clears the client auth state (hint + Sentry user), drops all
// cached data, and returns to /login. State is cleared even if the request errors so a UI holding
// stale user data can't linger.
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthState();
      queryClient.clear();
      void navigate({ to: '/login' });
    },
  });
};
