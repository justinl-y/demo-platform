import { useMutation } from '@tanstack/react-query';

import { passwordForgot } from './api.ts';

// Requests a reset email. No auth-state side effects (the user isn't logged in) — the page shows a
// generic confirmation on success. Because the API always returns 204, `isSuccess` never leaks
// whether the address maps to a real account.
export const usePasswordForgot = () =>
  useMutation({
    mutationFn: passwordForgot,
  });
