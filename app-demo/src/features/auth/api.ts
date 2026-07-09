import axios from 'axios';

import { api } from '../../lib/api-client.ts';

import type { Login, InternalUser, PasswordForgot, PasswordReset } from '#shared/types';

// POST /login — sets the auth cookies and returns the authenticated user.
export const login = async (body: Login): Promise<InternalUser> => {
  const {
    data,
  } = await api.post<InternalUser>('/login', body);

  return data;
};

// GET /me — returns the current user for a valid session; used to rehydrate on app load
// (the HttpOnly cookies can't be read by JS, so the server is the source of truth).
export const fetchMe = async (): Promise<InternalUser> => {
  const {
    data,
  } = await api.get<InternalUser>('/me');

  return data;
};

// POST /logout — clears the auth cookies server-side.
export const logout = async (): Promise<void> => {
  await api.post('/logout');
};

// POST /password/forgot — triggers a reset email. Always resolves 204 regardless of whether the
// address maps to an account (the API is deliberately enumeration-resistant), so callers get no
// signal about account existence.
export const passwordForgot = async (body: PasswordForgot): Promise<void> => {
  await api.post('/password/forgot', body);
};

// POST /password/reset — consumes the emailed token and sets the new password. Rejects with 400 on
// an invalid or expired token; on success the API also invalidates existing sessions server-side.
export const passwordReset = async (body: PasswordReset): Promise<void> => {
  await api.post('/password/reset', body);
};

// POST /password/reset/validate — checks a reset token without consuming it. Resolves true when the
// token is still usable; a 400 (used/expired/unknown) resolves false. A transient failure resolves
// true so an outage doesn't bounce a legitimate link to /login — the form + server still gate the
// actual reset.
export const isResetTokenValid = async (token: string): Promise<boolean> => {
  try {
    await api.post('/password/reset/validate', { password_reset_token: token });

    return true;
  }
  catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) return false;

    return true;
  }
};
