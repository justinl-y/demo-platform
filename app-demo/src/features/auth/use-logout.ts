import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { clearSentryUser } from '../../lib/sentry.ts';
import { logout } from './api.ts';
import { clearAuthHint } from './session.ts';

// Clears the auth cookies server-side, clears the logged-in hint, drops all cached data, and
// returns to /login. State is cleared even if the request errors so a UI holding stale user data
// can't linger.
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthHint();
      clearSentryUser();
      queryClient.clear();
      void navigate({ to: '/login' });
    },
  });
};
