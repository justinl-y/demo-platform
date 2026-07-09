import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { passwordReset } from './api.ts';

// Consumes the reset token and sets the new password, then sends the user to /login to sign in with
// it. The API invalidates any existing sessions on reset, so there's no session to seed here — the
// user authenticates fresh. A 400 (invalid/expired token) surfaces via `isError` on the page.
export const usePasswordReset = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: passwordReset,
    onSuccess: () => {
      void navigate({ to: '/login' });
    },
  });
};
